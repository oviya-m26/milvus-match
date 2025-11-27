import path from "node:path"
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, "..", ".env") })

export type EmbeddingProvider = "openai" | "local"
export type VectorProvider = "faiss" | "pinecone" | "milvus"

export interface DatasetSpec {
  slug: string
  alias: string
  type: "listings" | "skills" | "companies" | "resumes"
}

export const datasets: DatasetSpec[] = [
  { slug: "arnavpp/internshala-internship-dataset", alias: "internshala", type: "listings" },
  { slug: "sujaykapadnis/job-listings-from-naukricom", alias: "naukri-job", type: "listings" },
  { slug: "asaniczka/linkedin-job-postings", alias: "linkedin-job", type: "listings" },
  { slug: "promptcloudhq/us-uk-india-jobs", alias: "promptcloud-job", type: "listings" },
  { slug: "ankurzing/scraped-skill-data", alias: "skill-scrape", type: "skills" },
  { slug: "mahmoudalshami/linkedin-skills", alias: "linkedin-skills", type: "skills" },
  { slug: "muhammadnayeem/skills-dataset", alias: "skills-dataset", type: "skills" },
  { slug: "gauravduttakiit/resume-dataset", alias: "resume-gaurav", type: "resumes" },
  { slug: "snehaanbhawal/resume-dataset-job-title-annotations", alias: "resume-annotated", type: "resumes" },
  { slug: "mahimasingla09/profiles-data-datasets", alias: "profiles", type: "resumes" },
  { slug: "saurabhshahane/job-descriptions-dataset", alias: "job-descriptions", type: "listings" },
  { slug: "promptcloudhq/jobs-on-naukricom", alias: "naukri-descriptions", type: "listings" },
  { slug: "kapastor/2020-student-salary-survey", alias: "salary", type: "listings" },
  { slug: "peopledatalabssf/companies-dataset", alias: "companies", type: "companies" }
]

export const config = {
  dataDir: path.resolve(__dirname, "..", "data"),
  rawDir: path.resolve(__dirname, "..", "data", "raw"),
  cleanDir: path.resolve(__dirname, "..", "data", "clean"),
  vectorDir: path.resolve(__dirname, "..", "data", "vectorstore"),
  dbPath: path.resolve(__dirname, "..", "data", "db.sqlite"),
  logsPath: path.resolve(__dirname, "..", "data", "logs"),
  embeddings: (process.env.EMBEDDING_PROVIDER as EmbeddingProvider) || "openai",
  vectorProvider: (process.env.VECTOR_PROVIDER as VectorProvider) || "faiss",
  openAiKey: process.env.OPENAI_API_KEY,
  kaggle: {
    username: process.env.KAGGLE_USERNAME,
    key: process.env.KAGGLE_KEY,
  },
}

export const ensureFolders = () => {
  return [
    config.rawDir,
    config.cleanDir,
    config.vectorDir,
    config.logsPath,
    path.resolve(config.dataDir, "reports"),
    path.resolve(config.dataDir, "samples"),
  ]
}



