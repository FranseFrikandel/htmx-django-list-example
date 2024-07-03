from django.views.generic import ListView
from .models import User


# Create your views here.
class UserList(ListView):
    model = User
    template_name = "user_list.html"
    paginate_by = 15

    def get_queryset(self):
        query = User.objects
        if self.request.GET.get("q", "") != "":
            query = query.filter(name__icontains=self.request.GET["q"])
        return query.order_by("name")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.request.headers.get("HX-Request", False):
            context["partial"] = True
        return context
