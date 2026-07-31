class ScoringValidator:
    @staticmethod
    def validate_score(score: float) -> bool:
        if score < 0 or score > 15.0:
            raise ValueError(f"Score {score} out of bounds (0-15).")
        return True
