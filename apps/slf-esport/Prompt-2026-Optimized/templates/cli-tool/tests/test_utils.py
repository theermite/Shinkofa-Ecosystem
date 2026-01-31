"""Tests for utility functions."""

import pytest

from mycli.core.utils import validate_url, parse_version


class TestValidateUrl:
    """Tests for validate_url function."""

    def test_valid_http_url(self):
        """Test valid HTTP URL."""
        assert validate_url("http://example.com") is True

    def test_valid_https_url(self):
        """Test valid HTTPS URL."""
        assert validate_url("https://example.com") is True

    def test_invalid_url(self):
        """Test invalid URL."""
        assert validate_url("not-a-url") is False

    def test_empty_url(self):
        """Test empty URL."""
        assert validate_url("") is False


class TestParseVersion:
    """Tests for parse_version function."""

    def test_parse_valid_version(self):
        """Test parsing valid semantic version."""
        assert parse_version("1.2.3") == (1, 2, 3)

    def test_parse_major_version(self):
        """Test parsing major version."""
        assert parse_version("2.0.0") == (2, 0, 0)

    def test_parse_invalid_version_raises_error(self):
        """Test parsing invalid version raises ValueError."""
        with pytest.raises(ValueError):
            parse_version("invalid")

    def test_parse_incomplete_version_raises_error(self):
        """Test parsing incomplete version raises ValueError."""
        with pytest.raises(ValueError):
            parse_version("1.2")
