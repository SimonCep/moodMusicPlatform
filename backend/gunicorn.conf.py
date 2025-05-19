import multiprocessing
import os

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes - using a more reasonable number
workers = multiprocessing.cpu_count() + 1
worker_class = 'sync'
worker_connections = 1000
timeout = 30
keepalive = 2

# SSL Settings
certfile = os.environ.get('SSL_CERTIFICATE', '/app/certs/cert.pem')
keyfile = os.environ.get('SSL_PRIVATE_KEY', '/app/certs/key.pem')

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# Process naming
proc_name = 'moodmusic_gunicorn'

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# Django WSGI application path
wsgi_app = "backend.wsgi:application" 