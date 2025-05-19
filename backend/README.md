# Mood Music Platform Backend

This is the backend application for the Mood Music Platform, built with Django and Django REST Framework.

## Features

- JWT Authentication
- Password reset functionality
- OpenAI integration for mood analysis
- Spotify API integration
- GeoIP2 location services
- PostgreSQL database
- SSL/HTTPS support

## Technology Stack

- Django 4.x
- Django REST Framework
- PostgreSQL
- Gunicorn
- OpenAI API
- Spotify API
- GeoIP2

## Development Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables in `.env`:
```env
# Database Configuration
POSTGRES_DB=bakis
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
DB_NAME='bakis'
DB_USER='admin'
DB_PASSWORD='password'
DB_HOST='db'
DB_PORT='5432'

# Django Configuration
SECRET_KEY='your-secret-key'
DEBUG=True
CORS_ALLOWED_ORIGINS=https://localhost:3000

# External Services
OPENAI_API_KEY=your_openai_api_key

# Email Configuration
EMAIL_HOST_USER=moodmusicplatform@gmail.com
EMAIL_HOST_PASSWORD=your_app_specific_password

# Frontend URL
FRONTEND_URL=https://localhost:3000
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Start the development server:
```bash
python manage.py runserver
```

The API will be available at `https://localhost:8000`.

## Environment Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| POSTGRES_DB | PostgreSQL database name | bakis |
| POSTGRES_USER | PostgreSQL username | admin |
| POSTGRES_PASSWORD | PostgreSQL password | (secure password) |
| DB_NAME | Django database name | bakis |
| DB_USER | Django database user | admin |
| DB_PASSWORD | Django database password | (secure password) |
| DB_HOST | Database host | db |
| DB_PORT | Database port | 5432 |
| SECRET_KEY | Django secret key | (generate secure key) |
| DEBUG | Debug mode | False in production |
| CORS_ALLOWED_ORIGINS | Allowed CORS origins | https://localhost:3000 |
| OPENAI_API_KEY | OpenAI API key | (from OpenAI Dashboard) |
| EMAIL_HOST_USER | Gmail address | moodmusicplatform@gmail.com |
| EMAIL_HOST_PASSWORD | Gmail app password | (app-specific password) |
| FRONTEND_URL | Frontend application URL | https://localhost:3000 |

## SSL Configuration

The development server uses SSL certificates for HTTPS. The certificates should be placed in the `certs` directory:
- `certs/cert.pem` - SSL certificate
- `certs/key.pem` - SSL private key

## Available Commands

- `python manage.py runserver` - Start development server
- `python manage.py migrate` - Run database migrations
- `python manage.py createsuperuser` - Create admin user
- `python manage.py test` - Run tests
- `python manage.py collectstatic` - Collect static files

## Production Deployment

For production:
1. Set `DEBUG=False`
2. Generate a new secure `SECRET_KEY`
3. Use proper SSL certificates
4. Configure proper CORS settings
5. Use strong database passwords
6. Set up proper email configuration
7. Use Gunicorn as the WSGI server
8. Set up Nginx as a reverse proxy 