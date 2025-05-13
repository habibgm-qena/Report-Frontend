export type TimeRange = '6m' | '1y' | '2y'

function formatDate(dateStr: string): string {
  const [day, month, year] = dateStr.split('/')
  return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default formatDate;