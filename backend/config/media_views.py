import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
import cloudinary.uploader


class MediaUploadView(APIView):
    """
    Direct Media Upload Endpoint.
    Uploads images to Cloudinary CDN or Django default storage.
    """
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file') or request.FILES.get('image')
        if not file_obj:
            return Response({'error': 'No file was provided.'}, status=status.HTTP_400_BAD_REQUEST)

        cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME', '').strip()
        api_key = os.getenv('CLOUDINARY_API_KEY', '').strip()
        api_secret = os.getenv('CLOUDINARY_API_SECRET', '').strip()

        if cloud_name and api_key and api_secret:
            try:
                res = cloudinary.uploader.upload(
                    file_obj,
                    folder="freshcake",
                    cloud_name=cloud_name,
                    api_key=api_key,
                    api_secret=api_secret
                )
                url = res.get('secure_url') or res.get('url')
                return Response({'url': url, 'public_id': res.get('public_id')}, status=status.HTTP_201_CREATED)
            except Exception as e:
                # Fallback to local / default storage if Cloudinary rejects credentials
                file_name = default_storage.save(f"uploads/{file_obj.name}", file_obj)
                url = default_storage.url(file_name)
                return Response({'url': url, 'warning': f'Cloudinary fallback: {str(e)}'}, status=status.HTTP_201_CREATED)
        else:
            file_name = default_storage.save(f"uploads/{file_obj.name}", file_obj)
            url = default_storage.url(file_name)
            return Response({'url': url}, status=status.HTTP_201_CREATED)
