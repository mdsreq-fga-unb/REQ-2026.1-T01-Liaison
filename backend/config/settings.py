"""
Django settings for Liaison project.
"""

from datetime import timedelta
from pathlib import Path

from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = config("SECRET_KEY", default="django-insecure-change-me-in-production")
DEBUG = config("DEBUG", default=True, cast=bool)

# ---------------------------------------------------------------------------
# ALLOWED_HOSTS — built from LOCAL_IP so Expo Go (device/emulator) can reach
# the backend over Wi-Fi. Set LOCAL_IP in .env to your machine's local IP.
# Wildcard (*) is the fallback when LOCAL_IP is missing (safe: DEBUG=True).
# ---------------------------------------------------------------------------
LOCAL_IP = config("LOCAL_IP", default="")
_extra_hosts = config("ALLOWED_HOSTS_EXTRA", default="", cast=Csv())
_hosts = ["localhost", "127.0.0.1", "0.0.0.0"]
if LOCAL_IP:
    _hosts.append(LOCAL_IP)
_hosts.extend(h for h in _extra_hosts if h)
ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default=",".join(_hosts) if LOCAL_IP else "localhost,127.0.0.1,0.0.0.0,*",
    cast=Csv(),
)

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    # Local apps
    "users",
    "opportunities",
    "applications",
    "certificates",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# DATABASE_URL is read from .env (local) or set by docker-compose (Container).
# No hardcoded fallback — fails fast if missing.
_db_url = config("DATABASE_URL")

# Parse DATABASE_URL manually for compatibility
import re  # noqa: E402

_db_match = re.match(
    r"postgres(?:ql)?://(?P<user>[^:]+):(?P<password>[^@]+)@(?P<host>[^:]+):(?P<port>\d+)/(?P<name>.+)",
    _db_url,
)

if _db_match:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": _db_match.group("name"),
            "USER": _db_match.group("user"),
            "PASSWORD": _db_match.group("password"),
            "HOST": _db_match.group("host"),
            "PORT": _db_match.group("port"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": "liaison",
            "USER": "postgres",
            "PASSWORD": "postgres",
            "HOST": "localhost",
            "PORT": "5432",
        }
    }

AUTH_USER_MODEL = "users.User"

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
    {"NAME": "users.validators.LettersAndNumbersValidator"},
]

LANGUAGE_CODE = "pt-br"
TIME_ZONE = "America/Sao_Paulo"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        # Session auth kept for Django admin
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# ---------------------------------------------------------------------------
# CORS — origins built from LOCAL_IP so Expo Go Metro (port 8081) is allowed.
# Set LOCAL_IP in .env. Falls back to localhost-only when LOCAL_IP is missing.
# ---------------------------------------------------------------------------
_cors_origins = [
    "http://localhost:8081",
    "http://localhost:3000",
    "exp://localhost:8081",
]
if LOCAL_IP:
    _cors_origins += [
        f"http://{LOCAL_IP}:8081",
        f"exp://{LOCAL_IP}:8081",
    ]
_extra_origins = config("CORS_ALLOWED_ORIGINS_EXTRA", default="", cast=Csv())
_cors_origins.extend(o for o in _extra_origins if o)

CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default=",".join(_cors_origins),
    cast=Csv(),
)
CORS_ALLOW_CREDENTIALS = True
