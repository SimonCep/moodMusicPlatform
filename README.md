# Mood Music Platform

A personalized music recommendation platform that suggests music based on user moods and preferences. This project was developed as part of a bachelor's thesis.

## Technology Stack

### Backend
- Django 4.x (Python web framework)
- Django REST Framework (API development)
- PostgreSQL (Database)
- JWT Authentication
- OpenAI Integration
- GeoIP2 for location-based features

### Frontend
- React with TypeScript
- Vite (Build tool)
- Tailwind CSS
- Modern UI components with enhanced accessibility
- Responsive design with dark/light mode support

## Project Structure

```
moodMusicPlatform/
├── backend/                  # Django backend
│   ├── backend/              # Main Django app (settings, urls, wsgi, etc.)
│   ├── templates/            # Django HTML templates
│   ├── certs/                # SSL certificates for backend
│   ├── geoip_data/           # GeoIP2 data files
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile            # Backend Docker config
│   ├── gunicorn.conf.py      # Gunicorn server config
│   ├── manage.py             # Django management script
│   └── ...                   # Other backend files
├── frontend/                 # React frontend
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable UI and feature components
│   │   │   ├── ui/           # UI primitives (Button, Input, Card, etc.)
│   │   │   ├── auth/         # Authentication-related components
│   │   │   ├── report/       # Report-related components
│   │   │   ├── mood/         # Mood-related components
│   │   │   ├── common/       # Commonly used components (e.g., icons)
│   │   │   └── ...           # Other feature components
│   │   ├── pages/            # Top-level pages/routes (Home, Login, Register, etc.)
│   │   ├── services/         # API and integration services (e.g., Spotify, API calls)
│   │   ├── context/          # React context providers (e.g., AuthContext)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility/helper functions
│   │   ├── lib/              # Shared libraries/helpers
│   │   ├── features/         # Feature modules (e.g., playlists, help page features)
│   │   ├── data/             # Static data (e.g., genres, mood config)
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # App entry point
│   │   └── index.css         # Global styles
│   ├── public/               # Static assets
│   ├── certs/                # SSL certificates for frontend
│   ├── package.json          # Project metadata and scripts
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── vite.config.ts        # Vite configuration
│   └── ...                   # Other config and setup files
├── certs/                    # (Optional) Root SSL certificates
├── docker-compose.yml        # Docker composition for full stack
└── ...                       # Other root-level files
```

- The backend is a Django REST API with support for authentication, mood analysis, and Spotify integration.
- The frontend is a modern React app with TypeScript, Vite, and Tailwind CSS, featuring modular components and pages.
- See `frontend/src/components/ui/` for UI primitives, and `frontend/src/pages/` for route-level components.
- Feature-specific logic is grouped under `frontend/src/features/`.
- SSL certificates for local development are stored in the respective `certs/` folders.

## Key Features

- Mood-based music recommendations
- User preference learning
- Location-aware suggestions
- Enhanced security features:
  - Secure password management
  - Interactive password requirements UI
  - Real-time password matching validation
  - Password reset functionality
- Responsive design with dark/light mode
- Real-time mood analysis
- Accessibility-focused UI components

## Development Setup

1. Clone the repository:
```bash
git clone [your-repository-url]
cd moodMusicPlatform
```

2. Create and configure environment files:
```bash
# Create .env file in root directory
cp .env.example .env
```

Configure the following environment variables in your .env file:

### Database Configuration
```env
POSTGRES_DB=bakis
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
DB_NAME='bakis'
DB_USER='admin'
DB_PASSWORD='password'
DB_HOST='db'
DB_PORT='5432'
```

### Frontend Configuration
```env
VITE_API_URL=https://localhost:8000
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
FRONTEND_URL=https://localhost:3000
```

### Backend Configuration
```env
SECRET_KEY=your_django_secret_key
DEBUG=True
CORS_ALLOWED_ORIGINS=https://localhost:3000
```

### External Services
```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key
```

3. Generate the certificates for HTTPS communication
```bash
openssl req -x509 -newkey rsa:4096 -keyout backend/certs/key.pem -out backend/certs/cert.pem -sha256 -days 365 nodes -subj "/CN=localhost"
```

4. Start the development environment:
```bash
docker-compose up --build
```

5. Access the applications:
- Frontend: https://localhost:3000
- Backend API: https://localhost:8000

## Production Deployment

For production deployment, consider the following:

1. Use Gunicorn as the WSGI server
2. Set up Nginx as a reverse proxy
3. Use proper SSL certificates (stored in ./certs/)
4. Configure proper security settings
5. Set DEBUG=False in Django settings
6. Build the React application for production

## Environment Variables

Here's a complete list of required environment variables:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| POSTGRES_DB | PostgreSQL database name | bakis |
| POSTGRES_USER | PostgreSQL username | admin |
| POSTGRES_PASSWORD | PostgreSQL password | (secure password) |
| VITE_API_URL | Backend API URL | https://localhost:8000 |
| VITE_SPOTIFY_CLIENT_ID | Spotify API client ID | (from Spotify Developer Dashboard) |
| VITE_SPOTIFY_CLIENT_SECRET | Spotify API client secret | (from Spotify Developer Dashboard) |
| DEBUG | Django debug mode | False in production |
| CORS_ALLOWED_ORIGINS | Allowed CORS origins | https://localhost:3000 |
| OPENAI_API_KEY | OpenAI API key | (from OpenAI Dashboard) |
| EMAIL_HOST_USER | Gmail address | moodmusicplatform@gmail.com |
| EMAIL_HOST_PASSWORD | Gmail app password | (app-specific password) |
| FRONTEND_URL | Frontend application URL | https://localhost:3000 |
| DB_NAME | Django database name | bakis |
| DB_USER | Django database user | admin |
| DB_PASSWORD | Django database password | (secure password) |
| DB_HOST | Database host | db |
| DB_PORT | Database port | 5432 |
| SECRET_KEY | Django secret key | (generate secure key) |

## Security Features

The application implements several security best practices:
- HTTPS-only communication
- Secure password handling
- CSRF protection
- XSS prevention
- Rate limiting
- Input validation
- Secure session management

## Contributing

This project was developed as part of a bachelor's thesis. While it's open for educational purposes, please note that active development may be limited.

## Author

Simas Čeponis
Bachelor's Thesis
KTU
2025

## Security Notice

⚠️ **Important**: The environment variables shown above are example values. For production:
- Generate a new secure Django SECRET_KEY
- Use strong database passwords
- Set DEBUG=False
- Use proper API keys and credentials
- Use environment-specific email configuration
- Configure proper CORS settings
