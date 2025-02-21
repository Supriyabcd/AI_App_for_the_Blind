from django.db import models

# Create your models here.
class KnownFace(models.Model):
    name = models.CharField(max_length=255)
    encoding = models.BinaryField()  

    def __str__(self):
        return self.name