import sys
import os
import re
import json
import contractions
from nltk import pos_tag, word_tokenize
from nltk.corpus import wordnet, stopwords
from nltk.stem import WordNetLemmatizer
from googletrans import Translator

def get_wordnet_pos(treebank_tag):
    if treebank_tag.startswith('J'):
        return wordnet.ADJ
    elif treebank_tag.startswith('V'):
        return wordnet.VERB
    elif treebank_tag.startswith('N'):
        return wordnet.NOUN
    elif treebank_tag.startswith('R'):
        return wordnet.ADV
    else:
        return wordnet.NOUN

def gloss_match(root_dir, text):
    lemmatizer = WordNetLemmatizer()
    stop_words = set(stopwords.words('english'))
    expanded_text = contractions.fix(text)
    tokens = word_tokenize(expanded_text.lower())
    pos_tags = pos_tag(tokens)
    lemmatized_tokens = []
    for word, tag in pos_tags:
        wn_tag = get_wordnet_pos(tag)
        lemma = lemmatizer.lemmatize(word, wn_tag)
        lemmatized_tokens.append(lemma)

    matched = []

    for word in lemmatized_tokens:
        for dirpath, _, filenames in os.walk(root_dir):
            if f"{word}.jsonl" in filenames:
                matched.append(word)
                break

    return matched

def process_input(root_dir, text):
    translator = Translator()

    text = translator.translate(text, dest='en').text

    matched = gloss_match(root_dir, text)
    return matched

if __name__ == "__main__":
    text = sys.argv[1]  # Node.js 传过来的句子

    # ✅ 跟 connect_gloss_jsonl.py 一样的路径
    root_dir = os.path.join(os.path.dirname(__file__), "public", "glosses")

    matched_glosses = process_input(root_dir, text)

    # ✅ 打印 JSON，Node.js 可以读取
    print(json.dumps(matched_glosses))
