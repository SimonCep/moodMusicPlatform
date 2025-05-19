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
├── backend/             # Django backend
│   ├── backend/        # Main Django app
│   ├── templates/      # Django templates
│   ├── manage.py      # Django management script
│   └── requirements.txt
├── frontend/           # React frontend
│   ├── src/           # Source code
│   │   ├── components/  # Reusable React components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── styles/     # Global styles and Tailwind config
│   │   └── utils/      # Utility functions
│   ├── public/        # Static files
│   └── package.json
├── certs/             # SSL certificates
└── docker-compose.yml # Docker composition
```

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

3. Start the development environment:
```bash
docker-compose up --build
```

4. Access the applications:
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

Required environment variables:
- `SECRET_KEY`: Django secret key
- `DEBUG`: Boolean for debug mode
- `DB_*`: Database configuration
- `OPENAI_API_KEY`: OpenAI API key
- `EMAIL_*`: Email configuration for password reset
- `SPOTIFY_*`: Spotify API credentials
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `CORS_ORIGIN_WHITELIST`: Allowed CORS origins

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

## Environment Variables Reference

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