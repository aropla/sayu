import * as UI from '@/ui'
import { PluginFairy } from '@fairy/plugin-fairy'
import { CustomCursor } from './plugins'

const init = (options: SayuOptions): SayuComputedVariables => {
  const sectorDegree = 360 / options.items.length
  const sectorRadians = degreeToRadius(sectorDegree)

  return {
    sectorDegree: sectorDegree,
    sectorRadians: sectorRadians,
    sectorPath: calcSectorPath(options.r, options.R, sectorRadians),
    sectorScaledPath: calcSectorScaledPath(options.r, options.R, sectorRadians),
  }
}

const defaultOptions = {
  el: null,
  items: [],

  r: 500,
  R: 800,
  sectorScaled: true,
  sR: 10000,
  gap: 20,

  zIndex: 10000,

  sectorTemplateID: 'sayu_sector_template',
  sectorScaledTemplateID: 'sayu_sector_scaled_template',

  triggerOffset: 0,

  useCustomCursor: true,

  onShow: null,
  onHide: null,
  onSelect: null,
}

const normalizeOptions = (rawOptions: SayuRawOptions): SayuOptions => {
  const options = {
    ...defaultOptions,
    ...rawOptions,
  }

  options.el = typeof rawOptions.el === 'string' ? (document.querySelector(rawOptions.el) as HTMLElement) : rawOptions.el
  if (!options.el) {
    console.warn('[normalizeOptions]: el is invalid')
    options.el = document.body
  }

  if (!options.sectorScaled) {
    options.sR = 0
  }

  if (!options.sectorDegreeOffset) {
    options.sectorDegreeOffset = (_options, computed) => {
      return -(90 - computed.sectorDegree / 2)
    }
  }

  return options as SayuOptions
}

export type Sayu = {
  options: ReturnType<typeof normalizeOptions>
  computed: ReturnType<typeof init>
  containers: ReturnType<typeof UI.containers>

  mount: () => void
  show: () => void
  hide: () => void

  select: (index: string | number) => SayuSelected
  triggerOnSelect: () => void

  use: (plugin: Installable) => void
}
export type SayuPlugin = (sayu: Sayu) => {
  name: string
  setup: (...args: any) => void
  release: (...args: any) => void

  beforeShow: () => void
  afterShow: () => void

  beforeHide: () => void
  afterHide: () => void
}
export const Sayu = (rawOptions: SayuRawOptions): Sayu => {
  const options = normalizeOptions(rawOptions)
  const computed = init(options)
  const containers = UI.containers({
    r: options.r,
    R: options.R,
    sR: options.sR,
    gap: options.gap,
    zIndex: options.zIndex,
  })

  const pluginFairy = PluginFairy<SayuPlugin>({
    hooks: [
      'setup',
      'release',
      'beforeShow',
      'afterShow',
      'beforeHide',
      'afterHide',
    ]
  })

  const selected: SayuSelected = {
    $current: null,
    item: null,
    index: -1,
  }

  const sectorList: SayuSectorList = {
    $current: [],
    $last: [],
  }

  const sectorScaledList: SayuSectorList = {
    $current: [],
    $last: [],
  }

  const use = (plugin: Installable) => {
    pluginFairy.install(plugin, sayu)
  }

  const calcSectorDegree = (index: number) => {
    const degreeOffset = options.sectorDegreeOffset(options, computed)

    return computed.sectorDegree * index + degreeOffset
  }

  const mount = () => {
    pluginFairy.emit('setup')

    options.el.append(containers.$root)
  }

  const show = () => {
    pluginFairy.emit('beforeShow')

    if (typeof options.onShow === 'function') {
      options.onShow()
    } else {
      containers.$root.classList.add('active')
    }

    pluginFairy.emit('afterShow')
  }

  const hide = () => {
    pluginFairy.emit('beforeHide')

    if (typeof options.onHide === 'function') {
      options.onHide()
    } else {
      containers.$root.classList.remove('active')
    }

    pluginFairy.emit('afterHide')
  }

  const mountSectorTemplate = (options: SayuOptions, computed: SayuComputedVariables) => {
    const $sectorTemplate = UI.sectorSVGTemplate({
      id: options.sectorTemplateID,
      d: computed.sectorPath,
    })

    const $sectorScaledTemplate = UI.sectorSVGTemplate({
      id: options.sectorScaledTemplateID,
      d: computed.sectorScaledPath,
    })

    containers.$sectorTemplate.children[0].append($sectorTemplate, $sectorScaledTemplate)
  }

  const mountSectorScaled = (options: SayuOptions) => {
    const $menuitemList = options.items.map((_, index) =>
      UI.sectorScaled({
        id: index + '',
        sectorDegree: calcSectorDegree(index),
        clipPathID: options.sectorScaledTemplateID
      })
    )

    containers.$menuScaled.append(...$menuitemList)

    return $menuitemList.map(item => getSector(item))
  }

  const getIDFromMouseEvent = (event: MouseEvent) => {
    const currentTarget = event.currentTarget as HTMLElement
    const rawID = currentTarget.getAttribute('data-id')

    if (rawID == null) {
      return null
    }

    const id = Number(rawID)

    /* Check if id is invalid */
    if (Number.isNaN(id)) {
      return null
    }

    if (id < 0 || id >= options.items.length) {
      return null
    }

    return id
  }

  const mountSector = (options: SayuOptions, computed: SayuComputedVariables) => {
    const $menuitemList = options.items.map((item, index) =>
      UI.sector({
        id: index + '',
        sectorDegree: calcSectorDegree(index),
        sectorAdjustDegree: 90 - computed.sectorDegree / 2,
        contentTowardsDegree: -calcSectorDegree(index) - (90 - computed.sectorDegree / 2),
        clipPathID: options.sectorTemplateID,
        data: item,
      })
    )

    containers.$menu.append(...$menuitemList)

    return $menuitemList.map(item => getSector(item))
  }

  const updateMenuContainerLayer = (options: SayuOptions) => {
    const { zIndex } = options

    containers.$root.style.setProperty('--z-index', zIndex + '')
  }

  const updateSectorListEventBinding = (sectorList: SayuSectorList, event: (event: MouseEvent) => void) => {
    sectorList.$last.forEach($sector => {
      $sector.removeEventListener('mouseover', event)
    })

    sectorList.$current.forEach($sector => {
      $sector.addEventListener('mouseover', event)
    })

    sectorList.$last = sectorList.$current
  }

  const updatePanelEventBinding = ($panel: HTMLElement, event: (event: MouseEvent) => void) => {
    $panel.removeEventListener('mouseover', event)
    $panel.addEventListener('mouseover', event)
  }

  const select = (index: string | number) => {
    index = Number(index)

    if (index === selected.index) {
      return selected
    }

    const $c = selected.$current
    requestAnimationFrame(() => {
      $c?.classList.remove('active')
    })

    if (Number.isNaN(index) || index < 0) {
      selected.$current = null
      selected.item = null
      selected.index = -1
    } else {
      index = index % options.items.length

      selected.$current = sectorList.$current[index]
      selected.item = options.items[index]
      selected.index = index
    }

    requestAnimationFrame(() => {
      selected.$current?.classList.add('active')
    })

    updatePanelContent(selected.item?.content)

    return selected
  }

  const onSectorMouseover = (event: MouseEvent) => {
    const id = getIDFromMouseEvent(event)

    if (id == null) {
      return
    }

    select(id)
  }

  const onSectorScaledMouseover = (event: MouseEvent) => {
    const id = getIDFromMouseEvent(event)

    if (id == null) {
      return
    }

    select(id)
  }

  const onPanelMouseover = () => select(-1)

  const updatePanelContent = (content: undefined | string | ((item: SayuMenuItem | null) => string) = '') => {
    const $panel = containers.$panel
    const { $current, item } = selected

    let innerHTML = typeof content === 'function'
      ? content(item)
      : $current == null
        ? ''
        : content

    requestAnimationFrame(() => {
      $panel.innerHTML = innerHTML
    })
  }

  const handleCustomCursorPlugin = (options: SayuOptions) => {
    if (!options.useCustomCursor) {
      return
    }

    use(CustomCursor)
  }


  /**
   * Mount all UI
   */
  mountSectorTemplate(options, computed)
  sectorScaledList.$current = mountSectorScaled(options)
  sectorList.$current = mountSector(options, computed)

  /**
   * Bind mouseover event
   */
  updateSectorListEventBinding(sectorList, onSectorMouseover)
  updateSectorListEventBinding(sectorScaledList, onSectorScaledMouseover)
  updatePanelEventBinding(containers.$panel, onPanelMouseover)

  /**
   * Dynamic update UI by option
   */
  updateMenuContainerLayer(options)

  const triggerOnSelect = () => {
    options.onSelect && options.onSelect(selected.item)
  }

  const sayu: Sayu = {
    options,
    computed,
    containers,

    mount,
    show,
    hide,

    select,

    use,
    triggerOnSelect,
  }

  handleCustomCursorPlugin(options)

  return sayu
}

function getSector($menuitem: HTMLElement) {
  return $menuitem.children[0] as HTMLElement
}

function degreeToRadius(degree: number) {
  return degree * Math.PI / 180
}

function pointPositionInArc(r: number, radians: number): Vector2D {
  const x = 0.5 + Math.cos(radians) * r
  const y = 0.5 - Math.sin(radians) * r

  return {
    x,
    y,
  }
}

function calcSectorPath(r: number, R: number, radians: number) {
  r = (r / R) / 2
  R = (R / R) / 2

  const pointR = pointPositionInArc(R, radians)
  const pointr = pointPositionInArc(r, radians)

  return `
    M ${R + r},${R}
    L ${R + R},${R}
    A ${R},${R} 0 0,0 ${pointR.x},${pointR.y}
    L ${pointr.x},${pointr.y}
    A ${r},${r} 0 0,1 ${R + r},${R}
  `
}

function calcSectorScaledPath(r: number, R: number, radians: number) {
  r = (r / R) / 2
  R = (R / R) / 2

  const pointR = pointPositionInArc(R, radians)

  return `
    M ${R},${R}
    L ${R + R},${R}
    A ${R},${R} 0 0,0 ${pointR.x},${pointR.y}
    z
  `
}
