// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',  // Define que qualquer rota começando com "/api/"
        destination: 'http://localhost:8080/api/:path*',  // Redireciona para o seu backend em localhost:8080
      },
    ];
  },
};