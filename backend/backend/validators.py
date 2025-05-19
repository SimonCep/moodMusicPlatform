import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class CustomPasswordValidator:
    def __init__(self):
        self.password_regex = {
            'uppercase': r'[A-Z]',
            'lowercase': r'[a-z]',
            'number': r'[0-9]',
            'special_char': r'[!@#$%^&*(),.?":{}|<>]'
        }

    def validate(self, password, user=None):
        errors = []
        
        if not re.search(self.password_regex['uppercase'], password):
            errors.append(_('Password must contain at least one uppercase letter.'))
        
        if not re.search(self.password_regex['lowercase'], password):
            errors.append(_('Password must contain at least one lowercase letter.'))
        
        if not re.search(self.password_regex['number'], password):
            errors.append(_('Password must contain at least one number.'))
        
        if not re.search(self.password_regex['special_char'], password):
            errors.append(_('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>).'))
        
        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        return _("""Your password must contain:
        * At least one uppercase letter
        * At least one lowercase letter
        * At least one number
        * At least one special character (!@#$%^&*(),.?":{}|<>)
        * Minimum length of 8 characters""")

    def get_validation_rules(self, password):
        return {
            'uppercase': bool(re.search(self.password_regex['uppercase'], password)),
            'lowercase': bool(re.search(self.password_regex['lowercase'], password)),
            'number': bool(re.search(self.password_regex['number'], password)),
            'special_char': bool(re.search(self.password_regex['special_char'], password)),
            'min_length': len(password) >= 8
        } 