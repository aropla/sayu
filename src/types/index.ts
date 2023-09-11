type SayuSectorList = {
  $current: HTMLElement[]
  $last: HTMLElement[]
}

type SayuSelected = {
  $current: null | HTMLElement
  item: null | SayuMenuItem
  index: number
}

type SayuMenuItem = {
  title: string
  content: string
}

type Installable<T extends Fn = Fn> = {
  install: T
}

type SayuComputedVariables = {
  sectorDegree: number
  sectorRadians: number
  sectorPath: string
  sectorScaledPath: string
}

type SayuBaseOptions = {
  el: string | HTMLElement
  items: SayuMenuItem[]

  r?: number
  R?: number
  gap?: number

  zIndex?: number

  onShow?: () => void
  onHide?: () => void
  onSelect?: (item: null | SayuMenuItem) => void
  sectorDegreeOffset?: (options: SayuOptions, computed: SayuComputedVariables) => number

  sectorTemplateID?: string
  sectorScaledTemplateID?: string

  triggerOffset?: number

  useCustomCursor?: boolean
}

type SayuRawOptions = ({
    sectorScaled?: false
  } | {
    sectorScaled?: true
    sR?: number
  }) & SayuBaseOptions

type SayuOptions = Rewrite<Required<SayuRawOptions>, {
  el: HTMLElement
  sR: number
  gap: number
}>
