from dataclasses import dataclass

@dataclass
class ExperienceConfig:
    min_sample_size: int = 10
    boost_multiplier_max: float = 1.25
    cooloff_multiplier_min: float = 0.75
