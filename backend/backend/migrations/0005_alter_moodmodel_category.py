# Generated by Django 4.2.20 on 2025-05-06 19:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0004_moodmodel_category'),
    ]

    operations = [
        migrations.AlterField(
            model_name='moodmodel',
            name='category',
            field=models.CharField(blank=True, default='Other', max_length=50),
        ),
    ]
