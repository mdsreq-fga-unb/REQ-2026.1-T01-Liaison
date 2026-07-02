import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('opportunities', '0002_alter_opportunity_area_alter_opportunity_description_and_more'),
        ('users', '0007_organizationprofile_fields_and_gallery'),
    ]

    operations = [
        migrations.AddField(
            model_name='opportunity',
            name='featured',
            field=models.BooleanField(default=False),
        ),
        migrations.CreateModel(
            name='SavedOpportunity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('saved_at', models.DateTimeField(auto_now_add=True)),
                ('opportunity', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_by', to='opportunities.opportunity')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_opportunities', to='users.studentprofile')),
            ],
            options={
                'db_table': 'opportunities_savedopportunity',
                'unique_together': {('student', 'opportunity')},
            },
        ),
    ]
