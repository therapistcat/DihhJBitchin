import hashlib
import secrets

def hash_password(password: str) -> str:
    """
    Hash a password using SHA-256 with salt

    Args:
        password (str): Plain text password

    Returns:
        str: Hashed password with salt
    """
    # Generate a random salt
    salt = secrets.token_hex(16)
    # Create hash with salt
    password_hash = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    # Return salt + hash combined
    return f"{salt}:{password_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash

    Args:
        plain_password (str): Plain text password to verify
        hashed_password (str): Hashed password to compare against

    Returns:
        bool: True if password matches, False otherwise
    """
    try:
        # Split salt and hash
        salt, stored_hash = hashed_password.split(':')
        # Hash the plain password with the stored salt
        password_hash = hashlib.sha256((plain_password + salt).encode('utf-8')).hexdigest()
        # Compare hashes
        return password_hash == stored_hash
    except ValueError:
        # Invalid hash format
        return False
