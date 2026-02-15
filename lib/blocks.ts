import {
  Clock,
  ScanLine,
  DoorOpen,
  Thermometer,
  Droplets,
  Sun,
  Mic,
  MapPin,
  CircleDot,
  Globe,
  GitBranch,
  Sunrise,
  Calendar,
  Home,
  CloudSun,
  Timer,
  Repeat,
  Circle,
  Lightbulb,
  Palette,
  Plug,
  ArrowUpDown,
  Lock,
  Camera,
  Tv,
  ShieldAlert,
  Bell,
  Volume2,
  MessageSquare,
  Mail,
  Send,
  Sparkles,
  Eye,
  Wand2,
  AudioLines,
  Gauge,
  Save,
  Calculator,
  ArrowLeftRight,
  Zap,
  Play,
  type LucideIcon,
} from "lucide-react"

export type ParamType =
  | "text"
  | "number"
  | "select"
  | "time"
  | "weekdays"
  | "toggle"
  | "color"
  | "device_select"

export type BlockParam = {
  key: string
  label: string
  type: ParamType
  placeholder?: string
  defaultValue?: unknown
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: number
}

export type BlockDefinition = {
  type: string
  category: string
  name: string
  description: string
  icon: LucideIcon
  params: BlockParam[]
}

export const CATEGORY_COLORS: Record<string, string> = {
  trigger: "#AE5748",
  condition: "#6B8FAD",
  action: "#6B9E7B",
  notification: "#C4956A",
  ai: "#9E7B9E",
  data: "#8B8B99",
}

export const CATEGORY_NAMES: Record<string, string> = {
  trigger: "Триггеры",
  condition: "Условия",
  action: "Действия",
  notification: "Уведомления",
  ai: "AI Блоки",
  data: "Данные",
}

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  trigger: Zap,
  condition: GitBranch,
  action: Play,
  notification: Bell,
  ai: Sparkles,
  data: Gauge,
}

export const CATEGORY_ORDER = [
  "trigger",
  "condition",
  "action",
  "notification",
  "ai",
  "data",
]

// ─── ТРИГГЕРЫ (10) ──────────────────────────────────────

const TRIGGERS: BlockDefinition[] = [
  {
    type: "time",
    category: "trigger",
    name: "Время",
    description: "По расписанию / таймеру",
    icon: Clock,
    params: [
      { key: "time", label: "Время", type: "time", defaultValue: "08:00" },
      { key: "weekdays", label: "Дни", type: "weekdays", defaultValue: [1, 2, 3, 4, 5] },
    ],
  },
  {
    type: "motion_sensor",
    category: "trigger",
    name: "Датчик движения",
    description: "Обнаружено движение",
    icon: ScanLine,
    params: [
      { key: "device_id", label: "Датчик", type: "device_select", placeholder: "Выберите датчик движения" },
      { key: "sensitivity", label: "Чувствительность", type: "number", defaultValue: 5, min: 1, max: 10 },
    ],
  },
  {
    type: "door_sensor",
    category: "trigger",
    name: "Датчик двери/окна",
    description: "Открыто / закрыто",
    icon: DoorOpen,
    params: [
      { key: "device_id", label: "Датчик двери", type: "device_select", placeholder: "Выберите датчик" },
      {
        key: "state",
        label: "Событие",
        type: "select",
        defaultValue: "open",
        options: [
          { value: "open", label: "Открыто" },
          { value: "close", label: "Закрыто" },
          { value: "both", label: "Любое" },
        ],
      },
    ],
  },
  {
    type: "temperature",
    category: "trigger",
    name: "Температура",
    description: "Выше / ниже порога",
    icon: Thermometer,
    params: [
      { key: "device_id", label: "Датчик температуры", type: "device_select", placeholder: "Выберите датчик" },
      {
        key: "operator",
        label: "Условие",
        type: "select",
        defaultValue: ">",
        options: [
          { value: ">", label: "Выше" },
          { value: "<", label: "Ниже" },
        ],
      },
      { key: "value", label: "Порог °C", type: "number", defaultValue: 25, step: 0.5 },
    ],
  },
  {
    type: "humidity",
    category: "trigger",
    name: "Влажность",
    description: "Выше / ниже порога",
    icon: Droplets,
    params: [
      { key: "device_id", label: "Датчик влажности", type: "device_select", placeholder: "Выберите датчик" },
      {
        key: "operator",
        label: "Условие",
        type: "select",
        defaultValue: ">",
        options: [
          { value: ">", label: "Выше" },
          { value: "<", label: "Ниже" },
        ],
      },
      { key: "value", label: "Порог %", type: "number", defaultValue: 60, min: 0, max: 100 },
    ],
  },
  {
    type: "light_level",
    category: "trigger",
    name: "Освещённость",
    description: "Темнее / светлее порога",
    icon: Sun,
    params: [
      { key: "device_id", label: "Датчик освещённости", type: "device_select", placeholder: "Выберите датчик" },
      {
        key: "operator",
        label: "Условие",
        type: "select",
        defaultValue: "<",
        options: [
          { value: "<", label: "Темнее" },
          { value: ">", label: "Светлее" },
        ],
      },
      { key: "value", label: "Порог lux", type: "number", defaultValue: 200 },
    ],
  },
  {
    type: "voice_command",
    category: "trigger",
    name: "Голосовая команда",
    description: "Распознано ключевое слово",
    icon: Mic,
    params: [
      { key: "keyword", label: "Ключевое слово", type: "text", placeholder: "включи свет" },
    ],
  },
  {
    type: "geolocation",
    category: "trigger",
    name: "Геолокация",
    description: "Пришёл / ушёл из дома",
    icon: MapPin,
    params: [
      {
        key: "event",
        label: "Событие",
        type: "select",
        defaultValue: "arrived",
        options: [
          { value: "arrived", label: "Пришёл" },
          { value: "left", label: "Ушёл" },
        ],
      },
      { key: "zone", label: "Зона", type: "text", defaultValue: "home", placeholder: "home" },
    ],
  },
  {
    type: "button",
    category: "trigger",
    name: "Кнопка",
    description: "Нажата физическая кнопка",
    icon: CircleDot,
    params: [
      { key: "device_id", label: "Кнопка", type: "device_select", placeholder: "Выберите кнопку" },
      {
        key: "action",
        label: "Действие",
        type: "select",
        defaultValue: "single",
        options: [
          { value: "single", label: "Одно нажатие" },
          { value: "double", label: "Двойное" },
          { value: "long", label: "Длинное" },
        ],
      },
    ],
  },
  {
    type: "webhook",
    category: "trigger",
    name: "Webhook",
    description: "Внешний сигнал по HTTP",
    icon: Globe,
    params: [
      { key: "path", label: "Путь", type: "text", placeholder: "/hook/my-trigger" },
    ],
  },
]

// ─── УСЛОВИЯ (8) ────────────────────────────────────────

const CONDITIONS: BlockDefinition[] = [
  {
    type: "if_else",
    category: "condition",
    name: "Если / Иначе",
    description: "Проверка условия",
    icon: GitBranch,
    params: [
      { key: "variable", label: "Переменная", type: "text", placeholder: "temperature" },
      {
        key: "operator",
        label: "Оператор",
        type: "select",
        defaultValue: "==",
        options: [
          { value: "==", label: "= Равно" },
          { value: "!=", label: "≠ Не равно" },
          { value: ">", label: "> Больше" },
          { value: "<", label: "< Меньше" },
          { value: ">=", label: "≥ Не меньше" },
          { value: "<=", label: "≤ Не больше" },
          { value: "contains", label: "Содержит" },
        ],
      },
      { key: "value", label: "Значение", type: "text", placeholder: "25" },
    ],
  },
  {
    type: "time_of_day",
    category: "condition",
    name: "Время суток",
    description: "День / ночь / утро / вечер",
    icon: Sunrise,
    params: [
      {
        key: "period",
        label: "Период",
        type: "select",
        defaultValue: "day",
        options: [
          { value: "morning", label: "Утро (6–12)" },
          { value: "day", label: "День (12–18)" },
          { value: "evening", label: "Вечер (18–23)" },
          { value: "night", label: "Ночь (23–6)" },
        ],
      },
    ],
  },
  {
    type: "day_of_week",
    category: "condition",
    name: "День недели",
    description: "Будни / выходные / конкретный день",
    icon: Calendar,
    params: [
      {
        key: "mode",
        label: "Режим",
        type: "select",
        defaultValue: "weekday",
        options: [
          { value: "weekday", label: "Будни" },
          { value: "weekend", label: "Выходные" },
          { value: "custom", label: "Выбрать дни" },
        ],
      },
      { key: "weekdays", label: "Дни", type: "weekdays", defaultValue: [1, 2, 3, 4, 5] },
    ],
  },
  {
    type: "home_mode",
    category: "condition",
    name: "Режим дома",
    description: "Дома / нет дома / сон / гости",
    icon: Home,
    params: [
      {
        key: "mode",
        label: "Режим",
        type: "select",
        defaultValue: "home",
        options: [
          { value: "home", label: "Дома" },
          { value: "away", label: "Нет дома" },
          { value: "sleep", label: "Сон" },
          { value: "guests", label: "Гости" },
        ],
      },
    ],
  },
  {
    type: "weather",
    category: "condition",
    name: "Погода",
    description: "Дождь / солнце / температура на улице",
    icon: CloudSun,
    params: [
      {
        key: "condition",
        label: "Условие",
        type: "select",
        defaultValue: "rain",
        options: [
          { value: "rain", label: "Дождь" },
          { value: "sunny", label: "Солнце" },
          { value: "cloudy", label: "Облачно" },
          { value: "snow", label: "Снег" },
          { value: "temp_above", label: "Температура выше" },
          { value: "temp_below", label: "Температура ниже" },
        ],
      },
      { key: "value", label: "Значение °C", type: "number", placeholder: "0" },
    ],
  },
  {
    type: "delay",
    category: "condition",
    name: "Задержка",
    description: "Подождать N секунд",
    icon: Timer,
    params: [
      { key: "seconds", label: "Секунды", type: "number", defaultValue: 5, min: 0, max: 86400 },
    ],
  },
  {
    type: "repeat",
    category: "condition",
    name: "Повтор",
    description: "Выполнить N раз",
    icon: Repeat,
    params: [
      { key: "count", label: "Количество", type: "number", defaultValue: 3, min: 1, max: 100 },
      { key: "interval_sec", label: "Интервал (сек)", type: "number", defaultValue: 1, min: 0 },
    ],
  },
  {
    type: "and_or",
    category: "condition",
    name: "AND / OR",
    description: "Объединение условий",
    icon: Circle,
    params: [
      {
        key: "gate",
        label: "Тип",
        type: "select",
        defaultValue: "and",
        options: [
          { value: "and", label: "AND — все условия" },
          { value: "or", label: "OR — любое условие" },
        ],
      },
    ],
  },
]

// ─── ДЕЙСТВИЯ С УСТРОЙСТВАМИ (10) ───────────────────────

const ACTIONS: BlockDefinition[] = [
  {
    type: "light_on",
    category: "action",
    name: "Свет вкл/выкл",
    description: "Управление освещением",
    icon: Lightbulb,
    params: [
      { key: "device_id", label: "Устройство", type: "device_select", placeholder: "Выберите лампу" },
      {
        key: "action",
        label: "Действие",
        type: "select",
        defaultValue: "on",
        options: [
          { value: "on", label: "Включить" },
          { value: "off", label: "Выключить" },
          { value: "toggle", label: "Переключить" },
        ],
      },
    ],
  },
  {
    type: "light_brightness",
    category: "action",
    name: "Свет яркость",
    description: "Установить яркость %",
    icon: Sun,
    params: [
      { key: "device_id", label: "Устройство", type: "device_select", placeholder: "Выберите лампу" },
      { key: "brightness", label: "Яркость %", type: "number", defaultValue: 80, min: 0, max: 100 },
      { key: "transition_ms", label: "Плавность (мс)", type: "number", defaultValue: 500, min: 0, max: 10000, step: 100 },
    ],
  },
  {
    type: "light_color",
    category: "action",
    name: "Свет цвет",
    description: "Установить цвет RGB",
    icon: Palette,
    params: [
      { key: "device_id", label: "Устройство", type: "device_select", placeholder: "Выберите лампу" },
      { key: "color", label: "Цвет", type: "color", defaultValue: "#AE5748" },
      { key: "transition_ms", label: "Плавность (мс)", type: "number", defaultValue: 500, min: 0, max: 10000, step: 100 },
    ],
  },
  {
    type: "outlet_toggle",
    category: "action",
    name: "Розетка вкл/выкл",
    description: "Управление умной розеткой",
    icon: Plug,
    params: [
      { key: "device_id", label: "Розетка", type: "device_select", placeholder: "Выберите розетку" },
      {
        key: "action",
        label: "Действие",
        type: "select",
        defaultValue: "on",
        options: [
          { value: "on", label: "Включить" },
          { value: "off", label: "Выключить" },
          { value: "toggle", label: "Переключить" },
        ],
      },
    ],
  },
  {
    type: "climate_set",
    category: "action",
    name: "Климат",
    description: "Установить температуру",
    icon: Thermometer,
    params: [
      { key: "device_id", label: "Климат-контроль", type: "device_select", placeholder: "Выберите устройство" },
      { key: "temperature", label: "Температура °C", type: "number", defaultValue: 22, min: 10, max: 35, step: 0.5 },
      {
        key: "mode",
        label: "Режим",
        type: "select",
        defaultValue: "auto",
        options: [
          { value: "heat", label: "Обогрев" },
          { value: "cool", label: "Охлаждение" },
          { value: "auto", label: "Авто" },
          { value: "off", label: "Выкл" },
        ],
      },
    ],
  },
  {
    type: "blinds_door",
    category: "action",
    name: "Жалюзи / Окно / Дверь",
    description: "Открыть / закрыть / установить %",
    icon: ArrowUpDown,
    params: [
      { key: "device_id", label: "Устройство", type: "device_select", placeholder: "Выберите жалюзи/дверь" },
      {
        key: "action",
        label: "Действие",
        type: "select",
        defaultValue: "open",
        options: [
          { value: "open", label: "Открыть" },
          { value: "close", label: "Закрыть" },
          { value: "set", label: "Установить %" },
        ],
      },
      { key: "position", label: "Позиция %", type: "number", defaultValue: 100, min: 0, max: 100 },
    ],
  },
  {
    type: "lock_control",
    category: "action",
    name: "Замок",
    description: "Открыть / закрыть замок",
    icon: Lock,
    params: [
      { key: "device_id", label: "Замок", type: "device_select", placeholder: "Выберите замок" },
      {
        key: "action",
        label: "Действие",
        type: "select",
        defaultValue: "lock",
        options: [
          { value: "lock", label: "Закрыть" },
          { value: "unlock", label: "Открыть" },
        ],
      },
    ],
  },
  {
    type: "camera_action",
    category: "action",
    name: "Камера",
    description: "Сделать фото / видео",
    icon: Camera,
    params: [
      { key: "device_id", label: "Камера", type: "device_select", placeholder: "Выберите камеру" },
      {
        key: "action",
        label: "Действие",
        type: "select",
        defaultValue: "snapshot",
        options: [
          { value: "snapshot", label: "Фото" },
          { value: "record", label: "Видео" },
          { value: "stream", label: "Трансляция" },
        ],
      },
    ],
  },
  {
    type: "media_control",
    category: "action",
    name: "ТВ / Медиа",
    description: "Вкл / выкл / канал",
    icon: Tv,
    params: [
      { key: "device_id", label: "Медиа-устройство", type: "device_select", placeholder: "Выберите ТВ" },
      {
        key: "action",
        label: "Действие",
        type: "select",
        defaultValue: "on",
        options: [
          { value: "on", label: "Включить" },
          { value: "off", label: "Выключить" },
          { value: "channel", label: "Канал" },
          { value: "volume", label: "Громкость" },
        ],
      },
      { key: "value", label: "Значение", type: "text", placeholder: "1" },
    ],
  },
  {
    type: "alarm_siren",
    category: "action",
    name: "Сирена / Сигнализация",
    description: "Включить / выключить сигнализацию",
    icon: ShieldAlert,
    params: [
      { key: "device_id", label: "Сигнализация", type: "device_select", placeholder: "Выберите сигнализацию" },
      {
        key: "action",
        label: "Действие",
        type: "select",
        defaultValue: "arm",
        options: [
          { value: "arm", label: "Поставить" },
          { value: "disarm", label: "Снять" },
          { value: "trigger", label: "Тревога" },
        ],
      },
    ],
  },
]

// ─── УВЕДОМЛЕНИЯ (5) ────────────────────────────────────

const NOTIFICATIONS: BlockDefinition[] = [
  {
    type: "push_notification",
    category: "notification",
    name: "Push-уведомление",
    description: "На телефон",
    icon: Bell,
    params: [
      { key: "title", label: "Заголовок", type: "text", placeholder: "Оповещение" },
      { key: "message", label: "Сообщение", type: "text", placeholder: "Что-то произошло" },
      {
        key: "priority",
        label: "Приоритет",
        type: "select",
        defaultValue: "normal",
        options: [
          { value: "low", label: "Низкий" },
          { value: "normal", label: "Обычный" },
          { value: "high", label: "Высокий" },
          { value: "urgent", label: "Срочный" },
        ],
      },
    ],
  },
  {
    type: "voice_announce",
    category: "notification",
    name: "Голосовое оповещение",
    description: "Через колонку",
    icon: Volume2,
    params: [
      { key: "message", label: "Сообщение", type: "text", placeholder: "Внимание!" },
      { key: "device_id", label: "Колонка", type: "device_select", placeholder: "Выберите колонку" },
      { key: "volume", label: "Громкость %", type: "number", defaultValue: 80, min: 0, max: 100 },
    ],
  },
  {
    type: "sms",
    category: "notification",
    name: "SMS",
    description: "Отправить SMS-сообщение",
    icon: MessageSquare,
    params: [
      { key: "phone", label: "Номер", type: "text", placeholder: "+7..." },
      { key: "message", label: "Сообщение", type: "text", placeholder: "Оповещение" },
    ],
  },
  {
    type: "email",
    category: "notification",
    name: "Email",
    description: "Отправить письмо",
    icon: Mail,
    params: [
      { key: "to", label: "Кому", type: "text", placeholder: "user@example.com" },
      { key: "subject", label: "Тема", type: "text", placeholder: "Cozy: оповещение" },
      { key: "body", label: "Текст", type: "text", placeholder: "Подробности..." },
    ],
  },
  {
    type: "messenger",
    category: "notification",
    name: "Telegram / WhatsApp",
    description: "Отправить сообщение в мессенджер",
    icon: Send,
    params: [
      {
        key: "service",
        label: "Сервис",
        type: "select",
        defaultValue: "telegram",
        options: [
          { value: "telegram", label: "Telegram" },
          { value: "whatsapp", label: "WhatsApp" },
        ],
      },
      { key: "chat_id", label: "Chat ID", type: "text", placeholder: "123456789" },
      { key: "message", label: "Сообщение", type: "text", placeholder: "Cozy: оповещение" },
    ],
  },
]

// ─── AI БЛОКИ (4) ───────────────────────────────────────

const AI_BLOCKS: BlockDefinition[] = [
  {
    type: "ai_request",
    category: "ai",
    name: "AI запрос",
    description: "Отправить данные в AI, получить ответ",
    icon: Sparkles,
    params: [
      { key: "prompt", label: "Промпт", type: "text", placeholder: "Проанализируй данные..." },
      { key: "context", label: "Контекст", type: "text", placeholder: "{{sensor.all}}" },
    ],
  },
  {
    type: "ai_analyze",
    category: "ai",
    name: "AI анализ",
    description: "Проанализировать показатели",
    icon: Eye,
    params: [
      { key: "data_source", label: "Источник данных", type: "text", placeholder: "{{sensors}}" },
      {
        key: "analysis_type",
        label: "Тип анализа",
        type: "select",
        defaultValue: "anomaly",
        options: [
          { value: "anomaly", label: "Аномалии" },
          { value: "trend", label: "Тренды" },
          { value: "prediction", label: "Прогноз" },
          { value: "summary", label: "Сводка" },
        ],
      },
    ],
  },
  {
    type: "ai_decision",
    category: "ai",
    name: "AI решение",
    description: "Пусть AI выберет действие",
    icon: Wand2,
    params: [
      { key: "context", label: "Контекст", type: "text", placeholder: "Данные для принятия решения..." },
      { key: "options", label: "Варианты (через ,)", type: "text", placeholder: "включить свет, закрыть шторы" },
    ],
  },
  {
    type: "ai_tts",
    category: "ai",
    name: "Голосовой AI",
    description: "Озвучить текст через TTS",
    icon: AudioLines,
    params: [
      { key: "text", label: "Текст", type: "text", placeholder: "Доброе утро!" },
      { key: "device_id", label: "Колонка", type: "device_select", placeholder: "Выберите колонку" },
      { key: "volume", label: "Громкость %", type: "number", defaultValue: 70, min: 0, max: 100 },
    ],
  },
]

// ─── ДАННЫЕ (4) ─────────────────────────────────────────

const DATA_BLOCKS: BlockDefinition[] = [
  {
    type: "sensor_read",
    category: "data",
    name: "Получить показание",
    description: "Прочитать значение с датчика",
    icon: Gauge,
    params: [
      { key: "device_id", label: "Датчик", type: "device_select", placeholder: "Выберите датчик" },
      {
        key: "sensor_type",
        label: "Тип",
        type: "select",
        defaultValue: "temperature",
        options: [
          { value: "temperature", label: "Температура" },
          { value: "humidity", label: "Влажность" },
          { value: "light", label: "Освещённость" },
          { value: "motion", label: "Движение" },
          { value: "co2", label: "CO₂" },
          { value: "pressure", label: "Давление" },
        ],
      },
    ],
  },
  {
    type: "save_variable",
    category: "data",
    name: "Сохранить значение",
    description: "Записать в переменную",
    icon: Save,
    params: [
      { key: "name", label: "Имя переменной", type: "text", placeholder: "my_var" },
      { key: "value", label: "Значение", type: "text", placeholder: "{{sensor.temp}}" },
    ],
  },
  {
    type: "math_calc",
    category: "data",
    name: "Математика",
    description: "Вычислить формулу",
    icon: Calculator,
    params: [
      {
        key: "operation",
        label: "Операция",
        type: "select",
        defaultValue: "+",
        options: [
          { value: "+", label: "Сложить (+)" },
          { value: "-", label: "Вычесть (−)" },
          { value: "*", label: "Умножить (×)" },
          { value: "/", label: "Разделить (÷)" },
          { value: "%", label: "Остаток (%)" },
        ],
      },
      { key: "left", label: "Значение A", type: "number", defaultValue: 0 },
      { key: "right", label: "Значение B", type: "number", defaultValue: 0 },
    ],
  },
  {
    type: "compare_values",
    category: "data",
    name: "Сравнить",
    description: "Больше / меньше / равно",
    icon: ArrowLeftRight,
    params: [
      { key: "left", label: "Значение A", type: "text", placeholder: "{{sensor.temp}}" },
      {
        key: "operator",
        label: "Оператор",
        type: "select",
        defaultValue: ">",
        options: [
          { value: "==", label: "= Равно" },
          { value: "!=", label: "≠ Не равно" },
          { value: ">", label: "> Больше" },
          { value: "<", label: "< Меньше" },
          { value: ">=", label: "≥ Не меньше" },
          { value: "<=", label: "≤ Не больше" },
        ],
      },
      { key: "right", label: "Значение B", type: "text", placeholder: "30" },
    ],
  },
]

// ─── Combined exports ────────────────────────────────────

export const ALL_BLOCKS: BlockDefinition[] = [
  ...TRIGGERS,
  ...CONDITIONS,
  ...ACTIONS,
  ...NOTIFICATIONS,
  ...AI_BLOCKS,
  ...DATA_BLOCKS,
]

export const BLOCK_DEFS: Record<string, BlockDefinition> = Object.fromEntries(
  ALL_BLOCKS.map((b) => [b.type, b])
)

export function getBlockIcon(blockType: string, category: string): LucideIcon {
  return BLOCK_DEFS[blockType]?.icon ?? CATEGORY_ICONS[category] ?? Zap
}

export function getDefaultConfig(blockType: string): Record<string, unknown> {
  const def = BLOCK_DEFS[blockType]
  if (!def) return {}
  const config: Record<string, unknown> = {}
  for (const p of def.params) {
    if (p.defaultValue !== undefined) config[p.key] = p.defaultValue
  }
  return config
}
