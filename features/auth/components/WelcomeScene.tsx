import { createContext, useContext, useEffect, type ComponentProps } from "react";
import { Image, StyleSheet, View, type ImageSourcePropType } from "react-native";
import Animated, {
  Easing,
  SensorType,
  useAnimatedSensor,
  useAnimatedStyle,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { softEnter } from "./softEnter";

/**
 * Cena da tela de boas-vindas: alguém sentado no alto de uma rocha olhando
 * para o pico com a bandeira — o "ponto de partida" do Avant.
 *
 * A rocha é o fundo de toda a metade de baixo da tela (inclusive atrás do
 * botão), então a cena fica ancorada no rodapé. Cada plano é um PNG próprio
 * em `assets/welcome`, posicionado numa grade de 1122 unidades de largura;
 * cada camada entra com a sua animação e reage ao giroscópio com a sua
 * profundidade.
 *
 * Em telas baixas a cena se adapta sem cortar o céu nem pôr o menino atrás
 * do botão: primeiro a rocha "afunda" além do rodapé; se não bastar, a cena
 * encolhe — e a rocha cresce em volta do ponto onde ele está sentado, para
 * continuar cobrindo a largura toda embaixo das ações.
 */

/** Fundo creme da ilustração — a tela inteira usa o mesmo tom. */
export const WELCOME_BG = "#FFF9F4";

const GRID_W = 1122;

/** Deslocamento máximo, em pontos, da camada que mais se mexe (depth = 1). */
const PARALLAX_MAX = 14;
/** Inclinação (rad) que já leva o parallax ao máximo. */
const TILT_RANGE = 0.35;
/** Folga mínima entre os pés do menino e o topo das ações. */
const FEET_CLEARANCE = 16;

const SKY_TOP = 79; // topo do menino na grade; o céu se posiciona a partir dele

type Piece = {
  source: ImageSourcePropType;
  /** Proporção largura/altura do PNG. */
  ratio: number;
  x: number;
  y: number;
  w: number;
  /**
   * Quanto a camada acompanha a inclinação: o fundo se mexe mais (1) e o
   * primeiro plano quase nada — a cena "gira" em volta do menino.
   */
  depth: number;
};

const SUN: Piece = { source: require("../../../assets/welcome/sun.png"), ratio: 1, x: 823, y: SKY_TOP - 79, w: 174, depth: 1 };
const CLOUD_LEFT: Piece = { source: require("../../../assets/welcome/cloud-1.png"), ratio: 260 / 71, x: 10, y: SKY_TOP + 55, w: 222, depth: 0.85 };
const CLOUD_RIGHT: Piece = { source: require("../../../assets/welcome/cloud-2.png"), ratio: 260 / 50, x: 975, y: SKY_TOP + 124, w: 180, depth: 0.85 };
// O PNG já vem com a base sumindo em transparência, como se as nuvens a
// cobrissem; a bandeira fica no mesmo ponto do céu de antes.
const MOUNTAINS: Piece = { source: require("../../../assets/welcome/mountains.png"), ratio: 1000 / 432, x: 70, y: SKY_TOP + 106, w: 1100, depth: 0.5 };
// Nuvem na frente da base da montanha, já sobre a névoa clara (em cima do
// laranja ela sumia, era da mesma cor). Mais perto que a montanha, então se
// mexe um pouco menos no parallax.
const CLOUD_MIST: Piece = { source: require("../../../assets/welcome/cloud-3.png"), ratio: 260 / 70, x: 640, y: SKY_TOP + 500, w: 300, depth: 0.4 };

// Sentado na crista da rocha. Mesma profundidade da rocha: os dois andam
// juntos no parallax e ele não escorrega.
const HIKER: Piece = { source: require("../../../assets/welcome/hiker.png"), ratio: 560 / 619, x: 40, y: SKY_TOP + 28, w: 452, depth: 0.15 };
/** Ponto de apoio (quadril) do menino e a linha dos pés, na grade. */
const SEAT = { x: HIKER.x + 158, y: HIKER.y + 392 };
const FEET_Y = HIKER.y + 499;

// A rocha passa um pouco da esquerda (o parallax não abre vão) e bem da
// direita, para a encosta cobrir a área das ações.
const ROCK: Piece = { source: require("../../../assets/welcome/rock-large.png"), ratio: 1122 / 1402, x: -10, y: 286, w: 1400, depth: 0.15 };
/** Altura da grade: até o pé da rocha, com uma folga para o parallax. */
const GRID_H = ROCK.y + ROCK.w / ROCK.ratio - 12;

type Entering = ComponentProps<typeof Animated.View>["entering"];
type AnimatedStyle = ComponentProps<typeof Animated.View>["style"];
type Frame = { left: number; top: number; width: number; height: number };

type Tilt = { x: SharedValue<number>; y: SharedValue<number> };
const TiltContext = createContext<Tilt | null>(null);

/**
 * Inclinação do aparelho, suavizada e normalizada em -1..1.
 *
 * A posição em que a pessoa segura o celular vira o "centro" e ele se
 * recentraliza devagar — ninguém precisa segurar reto para a cena ficar
 * parada. Por cima, uma deriva lenta mantém a cena viva mesmo sem
 * giroscópio (web, emulador) ou com o aparelho imóvel.
 */
function useTilt(enabled: boolean): Tilt {
  const rotation = useAnimatedSensor(SensorType.ROTATION, { interval: 16 });
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const calibrated = useSharedValue(false);
  const basePitch = useSharedValue(0);
  const baseRoll = useSharedValue(0);
  const startedAt = useSharedValue(0);

  useFrameCallback((frame) => {
    "worklet";
    const { pitch, roll } = rotation.sensor.value;
    if (!calibrated.value) {
      basePitch.value = pitch;
      baseRoll.value = roll;
      startedAt.value = frame.timestamp;
      calibrated.value = true;
    }
    // Recentraliza aos poucos na nova postura.
    basePitch.value += (pitch - basePitch.value) * 0.004;
    baseRoll.value += (roll - baseRoll.value) * 0.004;

    const clamp = (value: number) => Math.min(1, Math.max(-1, value));
    const t = frame.timestamp;

    // Movimento próprio, sem giroscópio: duas ondas lentas por eixo, com
    // períodos que não se alinham — a cena passeia numa curva orgânica que
    // não parece um vai-e-vem mecânico. Entra aos poucos depois da entrada
    // da tela (smoothstep de 1,5 s a 4,5 s) para não dar tranco.
    const since = (t - startedAt.value - 1500) / 3000;
    const ramp = Math.min(1, Math.max(0, since));
    const ease = ramp * ramp * (3 - 2 * ramp);
    const wanderX = (Math.sin(t / 3800) * 0.51 + Math.sin(t / 9100 + 1.3) * 0.24) * ease;
    const wanderY = (Math.sin(t / 5200 + 0.7) * 0.36 + Math.sin(t / 11700) * 0.15) * ease;

    const targetX = clamp((roll - baseRoll.value) / TILT_RANGE + wanderX);
    const targetY = clamp((pitch - basePitch.value) / TILT_RANGE + wanderY);

    // Filtro passa-baixa: tira o tremor do sensor e deixa o movimento macio.
    x.value += (targetX - x.value) * 0.07;
    y.value += (targetY - y.value) * 0.07;
  }, enabled);

  return { x, y };
}

/** Deslocamento da camada conforme a inclinação e a profundidade dela. */
function useParallax(depth: number) {
  const tilt = useContext(TiltContext);
  return useAnimatedStyle(() => {
    if (!tilt) return {};
    return {
      transform: [
        { translateX: -tilt.x.value * depth * PARALLAX_MAX },
        { translateY: -tilt.y.value * depth * PARALLAX_MAX * 0.6 },
      ],
    };
  });
}

/** Vai e volta infinito, com curva senoidal — para "respirar" e derivar. */
function useLoop(to: number, duration: number, startDelay: number, enabled: boolean) {
  const value = useSharedValue(0);
  useEffect(() => {
    if (!enabled) return;
    const ease = Easing.inOut(Easing.sin);
    value.value = withDelay(
      startDelay,
      withRepeat(withSequence(withTiming(to, { duration, easing: ease }), withTiming(0, { duration, easing: ease })), -1),
    );
  }, [duration, enabled, startDelay, to, value]);
  return value;
}

/** Posição e tamanho da peça, em pontos, para a escala da cena. */
function frameOf(piece: Piece, scale: number): Frame {
  const width = piece.w * scale;
  return { left: piece.x * scale, top: piece.y * scale, width, height: width / piece.ratio };
}

/**
 * Uma camada da cena: entrada suave (fora) → parallax (meio) → movimento
 * próprio (dentro). Cada efeito num View separado para não brigarem pelo
 * mesmo `transform`.
 */
function Layer({
  piece,
  frame,
  entering,
  idleStyle,
}: {
  piece: Piece;
  frame: Frame;
  entering?: Entering;
  idleStyle?: AnimatedStyle;
}) {
  const parallax = useParallax(piece.depth);
  return (
    <Animated.View entering={entering} pointerEvents="none" style={{ position: "absolute", ...frame }}>
      <Animated.View style={[StyleSheet.absoluteFill, parallax]}>
        <Animated.View style={[StyleSheet.absoluteFill, idleStyle]}>
          <Image source={piece.source} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

function Sun({ frame, entering, alive }: { frame: Frame; entering?: Entering; alive: boolean }) {
  // O sol pulsa devagar, como calor subindo.
  const pulse = useLoop(1, 3800, 1600, alive);
  const glow = useAnimatedStyle(() => ({
    opacity: 0.92 + pulse.value * 0.08,
    transform: [{ scale: 1 + pulse.value * 0.045 }],
  }));
  return <Layer piece={SUN} frame={frame} entering={entering} idleStyle={glow} />;
}

function Cloud({
  piece,
  frame,
  distance,
  duration,
  entering,
  alive,
}: {
  piece: Piece;
  frame: Frame;
  distance: number;
  duration: number;
  entering?: Entering;
  alive: boolean;
}) {
  const drift = useLoop(distance, duration, 1400, alive);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: drift.value }] }));
  return <Layer piece={piece} frame={frame} entering={entering} idleStyle={style} />;
}

function Hiker({ frame, entering, alive }: { frame: Frame; entering?: Entering; alive: boolean }) {
  // Respiração: o corpo cresce um tiquinho a partir de onde está sentado.
  const breath = useLoop(1, 2600, 1800, alive);
  const style = useAnimatedStyle(() => ({
    transformOrigin: "bottom",
    transform: [{ scaleY: 1 + breath.value * 0.012 }, { scaleX: 1 - breath.value * 0.004 }],
  }));
  return <Layer piece={HIKER} frame={frame} entering={entering} idleStyle={style} />;
}

type WelcomeSceneProps = {
  /** Área disponível para a cena: da última linha de texto até o rodapé. */
  width: number;
  height: number;
  /** Altura do bloco de ações que fica por cima da rocha, no rodapé. */
  actionsHeight: number;
  /** Atraso base da entrada, para encaixar na cascata da tela. */
  delay?: number;
};

/**
 * Posiciona a cena na área disponível. Ancorada no rodapé; afunda a rocha
 * se sobrar cena; encolhe só se nem afundando o céu couber com os pés
 * acima das ações.
 */
function layoutFor(width: number, height: number, actionsHeight: number) {
  const fullScale = width / GRID_W;
  const fitScale = (height - actionsHeight - FEET_CLEARANCE) / FEET_Y;
  const scale = Math.max(0.1, Math.min(fullScale, fitScale));
  const sceneHeight = GRID_H * scale;

  const maxSink = Math.max(0, sceneHeight - FEET_Y * scale - actionsHeight - FEET_CLEARANCE);
  const sink = Math.min(Math.max(sceneHeight - height, 0), maxSink);

  // Com a cena encolhida, a rocha cresce em volta do quadril do menino: ele
  // continua sentado e ela continua cobrindo a largura toda.
  const grow = fullScale / scale;
  const rock: Frame = (() => {
    const w = ROCK.w * grow;
    const x = SEAT.x - (SEAT.x - ROCK.x) * grow;
    const y = SEAT.y - (SEAT.y - ROCK.y) * grow;
    return { left: x * scale, top: y * scale, width: w * scale, height: (w / ROCK.ratio) * scale };
  })();

  return { scale, sceneHeight, top: height - sceneHeight + sink, rock };
}

export function WelcomeScene({ width, height, actionsHeight, delay = 0 }: WelcomeSceneProps) {
  const reduceMotion = useReducedMotion();
  const alive = !reduceMotion;
  const tilt = useTilt(alive);

  if (width <= 0 || height <= 0) return null;
  const { scale, sceneHeight, top, rock } = layoutFor(width, height, actionsHeight);

  // Do fundo para a frente: céu, montanhas, rocha e, por último, a pessoa.
  // Tudo é fade-in com deslocamento curto e sobreposto no tempo, para a
  // cena "revelar" em vez de montar peça por peça.
  const enter = (offset: number, move: { dx?: number; dy?: number; duration?: number } = {}) =>
    reduceMotion ? undefined : softEnter({ delay: delay + offset, duration: 1100, dy: 12, ...move });

  return (
    <TiltContext.Provider value={alive ? tilt : null}>
      <View pointerEvents="none" style={{ position: "absolute", left: 0, top, width, height: sceneHeight }}>
        <Sun frame={frameOf(SUN, scale)} alive={alive} entering={enter(0, { dy: 16, duration: 1400 })} />

        <Cloud
          piece={CLOUD_LEFT}
          frame={frameOf(CLOUD_LEFT, scale)}
          distance={10}
          duration={6000}
          alive={alive}
          entering={enter(100, { dx: -16, dy: 0, duration: 1400 })}
        />
        <Cloud
          piece={CLOUD_RIGHT}
          frame={frameOf(CLOUD_RIGHT, scale)}
          distance={-8}
          duration={5200}
          alive={alive}
          entering={enter(220, { dx: 16, dy: 0, duration: 1400 })}
        />

        <Layer piece={MOUNTAINS} frame={frameOf(MOUNTAINS, scale)} entering={enter(200, { dy: 14 })} />
        <Cloud
          piece={CLOUD_MIST}
          frame={frameOf(CLOUD_MIST, scale)}
          distance={-12}
          duration={7000}
          alive={alive}
          entering={enter(300, { dx: 16, dy: 0, duration: 1400 })}
        />

        <Layer piece={ROCK} frame={rock} entering={enter(320, { dy: 10 })} />
        <Hiker frame={frameOf(HIKER, scale)} alive={alive} entering={enter(460, { dy: 12, duration: 1200 })} />
      </View>
    </TiltContext.Provider>
  );
}
