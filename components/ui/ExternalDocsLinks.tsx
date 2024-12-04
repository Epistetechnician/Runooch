import React from 'react'

interface ExternalLink {
  name: string
  url: string
  description: string
}

const links: ExternalLink[] = [
  {
    name: 'DefiLlama',
    url: 'https://defillama.com/docs/api',
    description: 'Official DefiLlama API Documentation'
  },
  {
    name: 'Dune Analytics',
    url: 'https://dune.com/docs/api/',
    description: 'Dune Analytics API Reference'
  },
  {
    name: 'The Graph',
    url: 'https://thegraph.com/docs/en/',
    description: 'The Graph Documentation'
  },
  {
    name: 'Messari',
    url: 'https://messari.io/api/docs',
    description: 'Messari API Documentation'
  },
  {
    name: 'BitQuery',
    url: 'https://bitquery.io/docs',
    description: 'BitQuery GraphQL API Docs'
  }
]

export const ExternalDocsLinks = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <span className="text-lg font-semibold text-blue-400">{link.name}</span>
          <span className="text-sm text-gray-300">{link.description}</span>
        </a>
      ))}
    </div>
  )
} 