import multiprocessing
import os

bind = "0.0.0.0:8000"
backlog = 2048
workers = multiprocessing.cpu_count() + 1
worker_class = 'sync'
worker_connections = 1000
timeout = 30
keepalive = 2
certfile = os.environ.get('SSL_CERTIFICATE', '/app/certs/cert.pem')
keyfile = os.environ.get('SSL_PRIVATE_KEY', '/app/certs/key.pem')
accesslog = '-'
errorlog = '-'
loglevel = 'info'
proc_name = 'moodmusic_gunicorn'
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None
wsgi_app = "backend.wsgi:application" 