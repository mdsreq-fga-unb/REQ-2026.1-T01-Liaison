# Generated migration for StudentProfile model

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='StudentProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('universidade', models.CharField(max_length=200)),
                ('curso', models.CharField(max_length=200)),
                ('matricula', models.CharField(max_length=50, unique=True)),
                ('semestre_atual', models.SmallIntegerField(blank=True, null=True)),
                ('turno', models.CharField(
                    blank=True,
                    choices=[
                        ('matutino', 'Matutino'),
                        ('vespertino', 'Vespertino'),
                        ('noturno', 'Noturno'),
                        ('integral', 'Integral'),
                    ],
                    max_length=20,
                    null=True,
                )),
                ('ano_conclusao', models.SmallIntegerField(blank=True, null=True)),
                ('horas_extensao_exigidas', models.SmallIntegerField(blank=True, null=True)),
                ('interesses', models.JSONField(blank=True, default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='student_profile',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'Perfil de Estudante',
                'verbose_name_plural': 'Perfis de Estudante',
                'db_table': 'users_studentprofile',
            },
        ),
    ]
