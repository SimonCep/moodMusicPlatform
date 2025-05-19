import os
from django.core.management.commands.runserver import Command as RunserverCommand
from django.core.servers.basehttp import WSGIServer
import ssl

class Command(RunserverCommand):
    def get_handler(self, *args, **options):
        handler = super().get_handler(*args, **options)
        
        cert_file = os.environ.get('SSL_CERTIFICATE')
        key_file = os.environ.get('SSL_PRIVATE_KEY')
        
        if cert_file and key_file and os.path.exists(cert_file) and os.path.exists(key_file):
            WSGIServer.ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            WSGIServer.ssl_context.load_cert_chain(certfile=cert_file, keyfile=key_file)
            print(f"\nSSL enabled with certificate: {cert_file} and key: {key_file}\n")
        else:
            print("\nWarning: SSL certificate or key not found. Running without SSL.\n")
            
        return handler 