from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'password_confirm']
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'username']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    user = UserSerializer(read_only=True)
    target_role_title = serializers.CharField(source='target_role.title', read_only=True, default='')
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'bio', 'phone', 'location',
            'linkedin_url', 'github_url', 'portfolio_url', 'avatar',
            'target_role', 'target_role_title', 'years_experience',
            'education_level', 'career_readiness_score',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'career_readiness_score', 'created_at', 'updated_at']
