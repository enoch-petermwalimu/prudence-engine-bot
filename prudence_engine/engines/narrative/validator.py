class NarrativeValidator:
    @staticmethod
    def validate(narrative) -> bool:
        if not narrative:
            raise ValueError("Narrative object required.")
        return True
