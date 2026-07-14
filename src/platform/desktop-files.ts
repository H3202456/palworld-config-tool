import { isTauri } from '@tauri-apps/api/core'

export interface DesktopTextFile {
  path: string
  name: string
  content: string
}

export interface SavedDesktopFile {
  path: string
  name: string
}

const CONFIG_FILE_FILTER = {
  name: 'Palworld 配置文件',
  extensions: ['ini', 'txt'],
}

function getFileName(path: string): string {
  const normalizedPath = path.replace(/\\/g, '/')
  const fileName = normalizedPath.split('/').pop()

  return fileName || path
}

export function isDesktopRuntime(): boolean {
  return isTauri()
}

export async function openDesktopConfigFile():
  Promise<DesktopTextFile | null> {
  if (!isDesktopRuntime()) {
    return null
  }

  const [{ open }, { readTextFile }] = await Promise.all([
    import('@tauri-apps/plugin-dialog'),
    import('@tauri-apps/plugin-fs'),
  ])

  const selectedPath = await open({
    title: '选择 PalWorldSettings.ini',
    multiple: false,
    directory: false,
    filters: [CONFIG_FILE_FILTER],
  })

  if (
    !selectedPath ||
    Array.isArray(selectedPath)
  ) {
    return null
  }

  const content = await readTextFile(selectedPath)

  return {
    path: selectedPath,
    name: getFileName(selectedPath),
    content,
  }
}

export async function saveDesktopConfigFile(
  content: string,
): Promise<SavedDesktopFile | null> {
  if (!isDesktopRuntime()) {
    return null
  }

  const [{ save }, { writeTextFile }] = await Promise.all([
    import('@tauri-apps/plugin-dialog'),
    import('@tauri-apps/plugin-fs'),
  ])

  const selectedPath = await save({
    title: '保存 PalWorldSettings.ini',
    defaultPath: 'PalWorldSettings.ini',
    filters: [CONFIG_FILE_FILTER],
  })

  if (!selectedPath) {
    return null
  }

  await writeTextFile(selectedPath, content)

  return {
    path: selectedPath,
    name: getFileName(selectedPath),
  }
}
