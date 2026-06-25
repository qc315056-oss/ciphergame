const API_BASE = 'https://cipher-data-teal.vercel.app/api'

async function request(url) {
  const res = await fetch(API_BASE + url)
  if (!res.ok) throw new Error('请求失败')
  return res.json()
}

export function getCipherTypes() {
  return request('/cipher-types')
}

export function getTutorial(cipherTypeId) {
  return request(`/tutorial/${cipherTypeId}`)
}

export function getLevels(cipherTypeId) {
  return request(`/levels/${cipherTypeId}`)
}

export function getLevelFiles(levelId) {
  return request(`/level-files/${levelId}`)
}

export async function checkAnswer(levelId, answer) {
  const res = await fetch(`${API_BASE}/check-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ levelId, answer }),
  })
  return res.json()
}
