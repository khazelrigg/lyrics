import re
#import spacy

# Load spaCy model
#nlp = spacy.load("en_core_web_sm")

def get_cleaned_title(title):
    """
    Clean the given song title by removing unwanted text such as versions, remixes, etc.
    """
    # Remove content in parentheses or brackets (e.g. "song title (Remix)" or "song title [Live]")
    cleaned_title = re.sub(r"\(.*?\)|\[.*?\]", "", title)

    # Remove extra spaces and leading/trailing whitespace
    cleaned_title = cleaned_title.strip()
    cleaned_title = re.sub(r'\s+', ' ', cleaned_title)

    return cleaned_title



def clean_punctuation(title):
    """
    Removes unnecessary punctuation from a song title while preserving key symbols
    such as dashes, apostrophes, and alphanumerics that might be part of the title or artist's name.
    """
    # Remove all punctuation except alphanumerics, spaces, dashes, and apostrophes
    cleaned_title = re.sub(r"[^\w\s\-'$&/]", "", title)
    return cleaned_title.strip()



def extract_basic_title(title):
    """
    Extracts the basic title from a song title, removing addons like 'Remix', 'feat.',
    'Explicit', 'Remastered', and other annotations that often follow the main title.
    """
    # Convert to lowercase for consistent processing
    title = title.lower()

    # Patterns to remove unnecessary annotations
    patterns_to_remove = [
        r"\(.*?\)",                 # Remove anything in parentheses
        r"\[.*?\]",                 # Remove anything in square brackets
        r"\s-\s.*?$",               # Remove ' - ' and anything after
        r"ft\.?\s.*?$",             # Remove 'ft.' or 'feat.' and anything after
        r"feat\.?\s.*?$",           # Remove 'feat.' and anything after
        r"remix$",                  # Remove trailing 'remix'
        r"explicit$",               # Remove 'explicit' at the end
        r"remastered\s?\d{4}$",     # Remove 'remastered YYYY'
        r"remastered$",             # Remove 'remastered' if no year
        r"edit$",                   # Remove 'edit' at the end
        r"live$",                   # Remove 'live' at the end
        r"version$",                # Remove 'version' at the end
        r"prod\.?\s.*?$",           # Remove 'prod.' and anything after
        r"deluxe$",                 # Remove 'deluxe' at the end
        r"acoustic$",               # Remove 'acoustic' at the end
        r"extended$",               # Remove 'extended' at the end
        r"special edition$",        # Remove 'special edition' at the end
        r"original soundtrack$",    # Remove 'original soundtrack' at the end
    ]

    # Apply each pattern
    for pattern in patterns_to_remove:
        title = re.sub(pattern, "", title)

    # Clean up extra whitespace
    title = title.strip()

    # Capitalize the first letter of each word for better readability
    title = " ".join(word.capitalize() for word in title.split())
    return title



def contains_japanese(text):
    # This regex matches Japanese characters, including kanji, hiragana, and katakana
    japanese_regex = re.compile(r'[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FBF\uFF66-\uFF9F]')
    return bool(japanese_regex.search(text))



#def generate_search_variations(track_name):
#    """
#    Generate up to 5 search-friendly variations of a song title for lyrics websites.
#
#    Args:
#    - track_name (str): The full track title as displayed in the media player.
#
#    Returns:
#    - dict: A dictionary containing the original title and up to 4 alternate search-friendly variations.
#    """
#    # Store variations in a set to avoid duplicates
#    variations = set()
#    original_title = track_name.strip()
#    variations.add(original_title)
#
#    # 1. Text before the first parentheses
#    if "(" in track_name:
#        variations.add(track_name.split("(", 1)[0].strip())
#
#    # 2. Text before the first dash
#    if "-" in track_name:
#        variations.add(track_name.split("-", 1)[0].strip())
#
#    # 3. Remove 'feat.', 'ft.', 'prod.' and associated text
#    no_feat = re.sub(r"(?i)(feat\.?|ft\.?|prod\.?|with)\s+\S+", "", track_name).strip()
#    if no_feat != track_name:
#        variations.add(no_feat)
#
#    # 4. Use spaCy to extract meaningful noun chunks
#    doc = nlp(track_name)
#    for chunk in doc.noun_chunks:
#        clean_chunk = chunk.text.strip()
#        if len(clean_chunk.split()) > 1 and clean_chunk.lower() not in track_name.lower():  # Include only multi-word chunks
#            variations.add(clean_chunk.title())
#
#    # Deduplicate, ensure original title is first, and limit to 5 variations
#    final_variations = [original_title] + [
#        variation for variation in variations if variation != original_title
#    ]
#    final_variations = final_variations[:5]
#
#    return {
#        "original": original_title,
#        "variations": final_variations,
#    }


def remove_suffix(text, suffix):
    if text.endswith(suffix):
        return text[:-len(suffix)]
    return text
