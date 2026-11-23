"""Feature test suite: click.LogLevel parameter type"""
import pytest
import click
from click.testing import CliRunner


def test_log_level_type_exists():
    """LogLevel is importable from click."""
    assert hasattr(click, "LogLevel"), "click.LogLevel not found"


def test_convert_debug():
    t = click.LogLevel()
    assert t.convert("DEBUG", None, None) == 10


def test_convert_info():
    t = click.LogLevel()
    assert t.convert("INFO", None, None) == 20


def test_convert_warning():
    t = click.LogLevel()
    assert t.convert("WARNING", None, None) == 30


def test_convert_error():
    t = click.LogLevel()
    assert t.convert("ERROR", None, None) == 40


def test_convert_critical():
    t = click.LogLevel()
    assert t.convert("CRITICAL", None, None) == 50


def test_case_insensitive():
    t = click.LogLevel()
    assert t.convert("debug", None, None) == 10
    assert t.convert("Warning", None, None) == 30


def test_invalid_raises():
    t = click.LogLevel()
    with pytest.raises(click.exceptions.BadParameter):
        t.convert("VERBOSE", None, None)


def test_in_cli_option():
    @click.command()
    @click.option("--level", type=click.LogLevel(), default="WARNING")
    def cli(level):
        click.echo(str(level))

    runner = CliRunner()
    result = runner.invoke(cli, ["--level", "DEBUG"])
    assert result.exit_code == 0
    assert result.output.strip() == "10"


def test_integer_passthrough():
    """Already-converted int should pass through unchanged."""
    t = click.LogLevel()
    assert t.convert(10, None, None) == 10
