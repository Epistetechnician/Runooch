/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'github.com',
          port: '',
          pathname: '/Epistetechnician/Runooch/**',
        },
        {
          protocol: 'https',
          hostname: 'raw.githubusercontent.com',
          port: '',
          pathname: '/Epistetechnician/Runooch/**',
        },
      ],
    },
  }
  
  module.exports = nextConfig 