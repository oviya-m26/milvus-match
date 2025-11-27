export interface CompanyRow {
  company_id: string
  company_name: string
  industry: string | null
  headquarters_city: string | null
  headquarters_country: string | null
  company_url: string | null
  size_bucket: string | null
  source: string | null
}

export const normalizeCompanies = (rows: Record<string, any>[]): CompanyRow[] => {
  return rows.map((row, index) => ({
    company_id: row.company_id || row.id || `company-${index}`,
    company_name: row.company_name || row.name || "Unknown",
    industry: row.industry || row.domain || null,
    headquarters_city: row.city || row.headquarters_city || null,
    headquarters_country: row.country || row.headquarters_country || null,
    company_url: row.company_url || row.url || null,
    size_bucket: row.size || row.size_bucket || null,
    source: row.source || row.dataset || "unknown",
  }))
}



