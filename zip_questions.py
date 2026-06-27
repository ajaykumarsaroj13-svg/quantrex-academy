import tarfile, os
with tarfile.open('questions.tar.gz', 'w:gz') as tar:
    tar.add('public/data/questions', arcname='public/data/questions')
