'use client'

import React from 'react'

interface NavItem {
  id: string
  label: string
  docUrl?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

interface SideNavProps {
  sections: NavSection[]
  activeSection: string
  onSectionChange: (id: string) => void
}

const DOC_URLS: Record<string, string> = {
  defillama: 'https://defillama.com/docs/api',
  dune: 'https://dune.com/docs/api/',
  footprint: 'https://docs.footprint.network/reference/introduction',
  flipside: 'https://docs.flipsidecrypto.com',
  messari: 'https://messari.io/api/docs',
  bitquery: 'https://docs.bitquery.io',
  subgraphs: 'https://thegraph.com/docs/en/',
}

export const SideNav: React.FC<SideNavProps> = ({
  sections,
  activeSection,
  onSectionChange,
}) => {
  return (
    <nav className="w-64 bg-gray-900 p-4">
      {sections.map((section) => (
        <div key={section.title} className="mb-6">
          <h3 className="text-gray-400 text-sm font-semibold mb-2">
            {section.title}
          </h3>
          <ul>
            {section.items.map((item) => (
              <li key={item.id} className="flex items-center">
                <button
                  className={`flex-grow text-left px-3 py-2 rounded ${
                    activeSection === item.id
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-400 hover:bg-gray-800'
                  }`}
                  onClick={() => onSectionChange(item.id)}
                >
                  {item.label}
                </button>
                {DOC_URLS[item.id] && (
                  <a
                    href={DOC_URLS[item.id]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 p-1 text-gray-400 hover:text-purple-400"
                    title="View Documentation"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
} 