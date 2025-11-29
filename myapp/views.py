from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .yolo_detector import run_detection

def home(request):
    return render(request, "index.html", {"message": "Hello from Django!"})

@csrf_exempt
def detect(request):
    if request.method == "POST":
        image_file = request.FILES.get('image')
        if not image_file:
            return JsonResponse({'error': 'No image provided'}, status=400)

        # Run YOLO detection
        result = run_detection(image_file.read())

        return JsonResponse(result)

    return JsonResponse({'error': 'Invalid request'}, status=405)