class RiskValidator:
    @staticmethod
    def validate_account(account) -> bool:
        if account.balance <= 0:
            raise ValueError("Account balance must be positive.")
        return True
