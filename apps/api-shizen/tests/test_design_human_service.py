"""
Tests for Design Human Service (Human Design Chart Calculation)

Validates:
1. Design Time calculation (88° solar arc with Newton-Raphson)
2. Gate mapping (all 64 gates)
3. Gate offset (start 302° Aquarius)
4. Complete chart generation
"""
import pytest
from datetime import datetime
from app.services.design_human_service import DesignHumanService


class TestDesignHumanService:
    """Test Design Human calculation service"""

    @pytest.fixture
    def service(self):
        """Create service instance"""
        return DesignHumanService()

    def test_service_initialization(self, service):
        """Test service initializes correctly"""
        assert service is not None
        assert len(service.GATE_WHEEL) == 64
        assert service.GATE_WHEEL_OFFSET == 302.0

    def test_gate_wheel_complete(self, service):
        """Test gate wheel contains all 64 unique gates"""
        gate_set = set(service.GATE_WHEEL)
        assert len(gate_set) == 64
        assert gate_set == set(range(1, 65))

    def test_design_time_calculation(self, service):
        """Test Design Time is calculated with 88° solar arc (not 88 days)"""
        # Test birth datetime
        birth_dt = datetime(1990, 6, 15, 14, 30, 0)
        jd_personality = service._datetime_to_jd(birth_dt)

        # Calculate design time
        jd_design = service._calculate_design_time(jd_personality)

        # Design time should be approximately 86-92 days before birth
        # (not exactly 88 days due to varying Sun speed ~0.95-1.02°/day)
        days_diff = jd_personality - jd_design
        assert 86.0 < days_diff < 92.0, f"Design time difference {days_diff} days is outside expected range (86-92)"

    def test_calculate_chart_complete(self, service):
        """Test complete chart calculation (integration test)"""
        chart = service.calculate_chart(
            birth_date="1990-06-15",
            birth_time="14:30:00",
            latitude=48.8566,
            longitude=2.3522,
            timezone_offset="+01:00"
        )

        # Validate chart structure
        assert "type" in chart
        assert "authority" in chart
        assert "profile" in chart
        assert "defined_centers" in chart
        assert "gates" in chart
        assert "channels" in chart

        # Validate type is one of the 5 HD types
        valid_types = ["generator", "manifesting_generator", "projector", "manifestor", "reflector"]
        assert chart["type"] in valid_types

        # Validate profile format (e.g., "1/3", "5/1")
        assert "/" in chart["profile"] or chart["profile"] == "Unknown"

        # Validate gates are present
        assert len(chart["gates"]) > 0

    def test_gate_mapping_coverage(self, service):
        """Test that all 64 gates are mapped to centers"""
        # Create test with all possible gate positions
        # This ensures our gate_to_center mapping is complete
        test_planets = []
        for i in range(64):
            # Create fake planetary positions covering all gates
            degrees = (302.0 + i * 5.625) % 360.0
            test_planets.append({
                "name": f"test_planet_{i}",
                "position_degrees": degrees
            })

        # Convert to gates
        gates = service._planets_to_gates(test_planets)

        # Extract gate numbers
        gate_numbers = [g["number"] for g in gates]

        # Should have all 64 unique gates
        assert len(set(gate_numbers)) == 64

        # Determine centers for all gates
        centers = service._determine_centers(gates)

        # Should have at least some centers defined
        assert len(centers) > 0

    def test_gate_offset_correct(self, service):
        """Test gate offset starts at 302° (Aquarius 27°)"""
        # Position at 302° should map to gate 41 (first in wheel)
        test_planets = [{
            "name": "sun",
            "position_degrees": 302.0
        }]

        gates = service._planets_to_gates(test_planets)

        assert gates[0]["number"] == 41, f"Expected gate 41 at 302°, got gate {gates[0]['number']}"

    def test_gate_lines_range(self, service):
        """Test gate lines are correctly calculated (1-6)"""
        # Test various positions within a gate
        test_positions = [
            302.0,  # Start of gate 41, line 1
            302.5,  # Middle of gate 41
            307.6,  # End of gate 41, close to line 6
        ]

        for degrees in test_positions:
            test_planets = [{"name": "test", "position_degrees": degrees}]
            gates = service._planets_to_gates(test_planets)

            line = gates[0]["line"]
            assert 1 <= line <= 6, f"Line {line} out of range at {degrees}°"

    def test_chart_with_known_reference(self, service):
        """Test with a known reference birth data"""
        # Example: Ra Uru Hu (founder of Human Design)
        # Birth: April 9, 1948, 02:18 AM, Montreal, Canada
        # Expected: Manifestor, Emotional Authority, 5/1 Profile
        # Note: This is approximate - exact validation requires jovianarchive.com

        chart = service.calculate_chart(
            birth_date="1948-04-09",
            birth_time="02:18:00",
            latitude=45.5017,  # Montreal
            longitude=-73.5673,
            timezone_offset="-05:00"
        )

        # Basic validation
        assert chart["type"] in ["generator", "manifesting_generator", "projector", "manifestor", "reflector"]
        assert chart["authority"] in ["emotional", "sacral", "splenic", "ego", "self_projected", "mental", "lunar", "none"]
        assert "/" in chart["profile"] or chart["profile"] == "Unknown"

        # Log for manual verification
        print(f"\n--- Ra Uru Hu Chart (Reference) ---")
        print(f"Type: {chart['type']}")
        print(f"Authority: {chart['authority']}")
        print(f"Profile: {chart['profile']}")
        print(f"Defined Centers: {chart['defined_centers']}")
        print(f"Strategy: {chart['strategy']}")


class TestReferenceProfiles:
    """
    Tests with known reference data validated against Genetic Matrix / Jovian Archive.
    These profiles have been manually verified against external HD calculators.
    """

    @pytest.fixture
    def service(self):
        """Create service instance"""
        return DesignHumanService()

    # ==================
    # JAY - Splenic Projector 1/3
    # Reference: Genetic Matrix, Jovian Archive
    # ==================
    def test_jay_type(self, service):
        """Jay should be a Projector (validated Genetic Matrix)"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,     # Lome, Togo
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        assert chart["type"] == "projector"

    def test_jay_authority(self, service):
        """Jay should have Splenic authority (validated Genetic Matrix)"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        assert chart["authority"] == "splenic"

    def test_jay_profile(self, service):
        """Jay should have 1/3 profile (validated Genetic Matrix)"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        assert chart["profile"] == "1/3"

    def test_jay_definition(self, service):
        """Jay should have Single definition (validated Genetic Matrix)"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        assert chart["definition"] == "single"

    def test_jay_channel_10_57(self, service):
        """Jay should have channel 10-57 Perfected Form (validated Genetic Matrix)"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        channel_gates = [tuple(sorted(ch["gates"])) for ch in chart["channels"]]
        assert (10, 57) in channel_gates, f"Channel 10-57 not found. Channels: {chart['channels']}"

    def test_jay_incarnation_cross(self, service):
        """Jay should have Right Angle Cross of Contagion (validated Genetic Matrix)"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        assert "Right Angle" in chart["incarnation_cross"]
        assert "Contagion" in chart["incarnation_cross"]

    def test_jay_variable(self, service):
        """Jay Variable should be PRL DLR (validated Jovian Archive screenshot)"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        assert chart["variable"] == "PRL DLR", f"Expected PRL DLR, got {chart['variable']}"

    # ==================
    # ANGE - Pure Generator 5/1
    # Reference: Genetic Matrix, Jovian Archive
    # ==================
    def test_ange_type(self, service):
        """Ange should be a Generator (validated Genetic Matrix)"""
        chart = service.calculate_chart(
            birth_date="1991-01-10",
            birth_time="04:50:00",
            latitude=48.879566,  # Les Lilas, France
            longitude=2.415796,
            timezone_offset="+01:00"
        )
        assert chart["type"] == "generator"

    def test_ange_authority(self, service):
        """Ange should have Sacral authority (validated Genetic Matrix)"""
        chart = service.calculate_chart(
            birth_date="1991-01-10",
            birth_time="04:50:00",
            latitude=48.879566,
            longitude=2.415796,
            timezone_offset="+01:00"
        )
        assert chart["authority"] == "sacral"

    def test_ange_profile(self, service):
        """Ange should have 5/1 profile (validated Genetic Matrix)"""
        chart = service.calculate_chart(
            birth_date="1991-01-10",
            birth_time="04:50:00",
            latitude=48.879566,
            longitude=2.415796,
            timezone_offset="+01:00"
        )
        assert chart["profile"] == "5/1"

    def test_ange_definition(self, service):
        """Ange should have Split definition (validated Genetic Matrix)"""
        chart = service.calculate_chart(
            birth_date="1991-01-10",
            birth_time="04:50:00",
            latitude=48.879566,
            longitude=2.415796,
            timezone_offset="+01:00"
        )
        assert chart["definition"] == "split"

    def test_ange_incarnation_cross(self, service):
        """Ange should have Left Angle Cross of Cycles (validated Genetic Matrix)"""
        chart = service.calculate_chart(
            birth_date="1991-01-10",
            birth_time="04:50:00",
            latitude=48.879566,
            longitude=2.415796,
            timezone_offset="+01:00"
        )
        assert "Left Angle" in chart["incarnation_cross"]
        assert "Cycles" in chart["incarnation_cross"]

    def test_ange_variable(self, service):
        """Ange Variable should be PLR DLL (validated Jovian Archive screenshot)"""
        chart = service.calculate_chart(
            birth_date="1991-01-10",
            birth_time="04:50:00",
            latitude=48.879566,
            longitude=2.415796,
            timezone_offset="+01:00"
        )
        assert chart["variable"] == "PLR DLL", f"Expected PLR DLL, got {chart['variable']}"

    def test_ange_channels(self, service):
        """Ange should have channels 11-56, 32-54, 42-53, 1-8 (validated Genetic Matrix)"""
        chart = service.calculate_chart(
            birth_date="1991-01-10",
            birth_time="04:50:00",
            latitude=48.879566,
            longitude=2.415796,
            timezone_offset="+01:00"
        )
        channel_gates = {tuple(sorted(ch["gates"])) for ch in chart["channels"]}
        expected_channels = {(11, 56), (32, 54), (42, 53), (1, 8)}
        for expected in expected_channels:
            assert expected in channel_gates, f"Channel {expected[0]}-{expected[1]} not found. Got: {channel_gates}"


class TestEdgeCases:
    """Edge case tests for HD calculation robustness"""

    @pytest.fixture
    def service(self):
        """Create service instance"""
        return DesignHumanService()

    def test_color_range_1_to_6(self, service):
        """All Color values should be between 1 and 6"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        for gate in chart["gates"]:
            if gate.get("color") is not None:
                assert 1 <= gate["color"] <= 6, f"Color {gate['color']} out of range for gate {gate['number']}"

    def test_tone_range_1_to_6(self, service):
        """All Tone values should be between 1 and 6"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        for gate in chart["gates"]:
            if gate.get("tone") is not None:
                assert 1 <= gate["tone"] <= 6, f"Tone {gate['tone']} out of range for gate {gate['number']}"

    def test_profile_lines_valid(self, service):
        """Profile lines should be between 1 and 6"""
        chart = service.calculate_chart(
            birth_date="1990-06-15",
            birth_time="14:30:00",
            latitude=48.8566,
            longitude=2.3522,
            timezone_offset="+01:00"
        )
        if chart["profile"] != "Unknown":
            line1, line2 = chart["profile"].split("/")
            assert 1 <= int(line1) <= 6
            assert 1 <= int(line2) <= 6

    def test_personality_and_design_gates_both_present(self, service):
        """Chart should have both personality and design gates"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        sides = {gate["side"] for gate in chart["gates"]}
        assert "personality" in sides, "No personality gates found"
        assert "design" in sides, "No design gates found"

    def test_personality_has_13_planets(self, service):
        """Personality side should have exactly 13 gates (one per planet)"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        pers_gates = [g for g in chart["gates"] if g["side"] == "personality"]
        assert len(pers_gates) == 13, f"Expected 13 personality gates, got {len(pers_gates)}"

    def test_design_has_13_planets(self, service):
        """Design side should have exactly 13 gates (one per planet)"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        des_gates = [g for g in chart["gates"] if g["side"] == "design"]
        assert len(des_gates) == 13, f"Expected 13 design gates, got {len(des_gates)}"

    def test_definition_consistency_with_channels(self, service):
        """Definition 'none' should have no channels; otherwise channels should exist"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        if chart["definition"] == "none":
            assert len(chart["channels"]) == 0
        else:
            assert len(chart["channels"]) > 0, "Non-none definition should have at least one channel"

    def test_variable_format(self, service):
        """Variable should follow format 'P[LR][LR] D[LR][LR]' or be 'Unknown'"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        variable = chart["variable"]
        if variable != "Unknown":
            assert len(variable) == 7, f"Variable '{variable}' should be 7 chars"
            assert variable[0] == "P"
            assert variable[1] in ("L", "R")
            assert variable[2] in ("L", "R")
            assert variable[3] == " "
            assert variable[4] == "D"
            assert variable[5] in ("L", "R")
            assert variable[6] in ("L", "R")

    def test_incarnation_cross_format(self, service):
        """Incarnation cross should contain angle type and cross name"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        cross = chart["incarnation_cross"]
        if cross != "Unknown":
            assert "Cross of" in cross, f"Incarnation cross '{cross}' should contain 'Cross of'"
            has_angle = ("Right Angle" in cross or "Left Angle" in cross or "Juxtaposition" in cross)
            assert has_angle, f"Incarnation cross '{cross}' should contain an angle type"

    def test_personality_planets_present(self, service):
        """Chart should include personality_planets data"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        assert "personality_planets" in chart
        assert len(chart["personality_planets"]) == 13

    def test_design_planets_present(self, service):
        """Chart should include design_planets data"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        assert "design_planets" in chart
        assert len(chart["design_planets"]) == 13

    def test_defined_plus_open_equals_nine(self, service):
        """Total centers (defined + open) should equal 9"""
        chart = service.calculate_chart(
            birth_date="1985-11-17",
            birth_time="11:10:00",
            latitude=6.1319,
            longitude=1.2228,
            timezone_offset="+00:00"
        )
        total = len(chart["defined_centers"]) + len(chart["open_centers"])
        assert total == 9, f"Total centers should be 9, got {total}"
