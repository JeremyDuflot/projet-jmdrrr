export const CAMPAIGN_FILE_EXTENSION = '.cplc.json'

const FORMAT = 'cplc'
const VERSION = 1

export function downloadCampaignFile(campaign) {
  const content = JSON.stringify({ format: FORMAT, version: VERSION, campaign }, null, 2)
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }))

  const link = document.createElement('a')
  link.href = url
  link.download = `${toFileName(campaign.name)}${CAMPAIGN_FILE_EXTENSION}`
  link.click()

  setTimeout(() => URL.revokeObjectURL(url))
}

export async function readCampaignFile(file) {
  if (!file.name.toLowerCase().endsWith(CAMPAIGN_FILE_EXTENSION)) {
    throw new Error(`Le fichier doit avoir l'extension ${CAMPAIGN_FILE_EXTENSION}.`)
  }

  let content
  try {
    content = JSON.parse(await file.text())
  } catch {
    throw new Error("Le fichier n'est pas un JSON valide.")
  }

  if (content?.format !== FORMAT || !isPlainObject(content.campaign)) {
    throw new Error('Ce fichier ne contient pas de campagne exportée.')
  }
  if (content.version > VERSION) {
    throw new Error("Ce fichier provient d'une version plus récente de l'application.")
  }

  return content.campaign
}

function toFileName(name) {
  return (
    String(name ?? '')
      .trim()
      .replaceAll(' ', '-')
      .toLowerCase() || 'campagne'
  )
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
