# backend/apps.py
from django.apps import AppConfig
import logging
import os

logger = logging.getLogger(__name__)

class BackendAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend'

    def ready(self):
        app_env = os.environ.get('APP_ENV')
        run_main = os.environ.get('RUN_MAIN')
        django_settings_module = os.environ.get('DJANGO_SETTINGS_MODULE')
        sys_argv = os.sys.argv

        is_reloader = bool(django_settings_module and run_main == 'true')
        is_management_command = any(cmd in sys_argv for cmd in ['makemigrations', 'migrate', 'collectstatic', 'createsuperuser'])

        should_run_startup_logic = (app_env == 'docker_startup') or (not is_reloader and not is_management_command)

        if should_run_startup_logic:
            logger.info("Django app ready. Checking for startup playlist generation.")
            try:
                from .management.commands.generate_specialized_playlists import run_startup_playlist_generation
                
                def startup_stdout(msg, style=None):
                    logger.info(f"[StartupPlaylistGen] {msg}")
                def startup_stderr(msg, style=None):
                    logger.error(f"[StartupPlaylistGen ERROR] {msg}")

                run_startup_playlist_generation(stdout_writer=startup_stdout, stderr_writer=startup_stderr)
            except ImportError as e:
                logger.error("Could not import run_startup_playlist_generation. Skipping startup playlist generation.", exc_info=True)
            except Exception as e:
                logger.error(f"An error occurred during startup playlist generation: {str(e)}", exc_info=True)
        elif is_reloader:
            logger.info("Django reloader active, skipping startup playlist generation in this process.")
        elif is_management_command:
            logger.info(f"Django management command ({sys_argv}) detected, skipping startup playlist generation.")
        else:
            logger.info("Skipping startup playlist generation (conditions not met based on combined logic).")
