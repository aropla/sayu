import { h, s } from '@fairy/dom-fairy'

type SectorScaledOptions = {
  id: string
  sectorDegree: number
  clipPathID: string
}
export const sectorScaled = (options: SectorScaledOptions) => {
  const {
    id,
    sectorDegree,
    clipPathID
  } = options

  return (h('div', { class: 'sayu-menu-item', style: `transform: rotate(${sectorDegree}deg);` },
    h('div', { class: 'sayu-sector', style: `clip-path: url(#${clipPathID});`, 'data-id': id })
  ))
}

type SectorOptions<T = any> = {
  id: string
  sectorDegree: number
  sectorAdjustDegree: number
  contentTowardsDegree: number
  clipPathID: string
  data: T
}
export const sector = <T extends SayuMenuItem>(options: SectorOptions<T>) => {
  const {
    id,
    sectorDegree,
    sectorAdjustDegree,
    contentTowardsDegree,
    clipPathID,
    data,
  } = options

  return (
    h('div', { class: 'sayu-menu-item sayu-sector-shadow', style: `transform: rotate(${sectorDegree}deg);` },
      h('div', { class: 'sayu-sector', style: `clip-path: url(#${clipPathID});`, 'data-id': id },
        h('div', { class: 'sayu-sector-adjust-degree', style: `transform: rotate(${sectorAdjustDegree}deg);` },
          h('div', { class: 'sayu-sector-adjust-towards', style: `transform: rotate(${contentTowardsDegree}deg);` },
            h('div', { class: 'sayu-content' }, data.title)
          )
        )
      )
    )
  )
}

type SectorSVGTemplateOptions = {
  d: string
  id: string
}
export const sectorSVGTemplate = (options: SectorSVGTemplateOptions) => {
  const {
    d,
    id,
  } = options

  return (
    s('clipPath', { 'clipPathUnits': 'objectBoundingBox', id: id },
      s('path', { fill: 'none', d: d })
    )
  )
}

type ContainersOptions = {
  R: number
  r: number
  sR: number
  gap: number
  zIndex: number
}
export const containers = (options: ContainersOptions) => {
  const $menuScaled = h('div', { class: 'sayu-menu-scaled' })
  const $menu = h('div', { class: 'sayu-menu' })
  const $panel = h('div', { class: 'sayu-panel' })
  const $sectorTemplate = s('svg', { width: '0', height: '0' }, [
    s('defs', {})
  ])

  const $menuContainer = h('div', { class: 'sayu-menu-container' }, [
    $menuScaled,
    $menu,
    $panel,
    $sectorTemplate,
  ])

  const $root = h(
    'div',
    {
      class: 'sayu sayu-mask',
      style: `
        --R: ${options.R}px;
        --r: ${options.r}px;
        --sR: ${options.sR}px;
        --gap: ${options.gap}px;
      `
    }, [
      $menuContainer,
    ]
  )

  return {
    $root,
    $menuContainer,
    $menuScaled,
    $menu,
    $panel,
    $sectorTemplate,
  }
}
