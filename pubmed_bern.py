import requests
from requests.api import head
import xmltodict
import pandas as pd
import spacy

def get_pubmed_ids(headers):
    url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=lung+diseases%5bMeSH+Major+Topic[review]&mindate=2020&maxdate=2022&sort=date'
    response = requests.get(url, headers=headers)
    data = xmltodict.parse(response.content)['eSearchResult']

    count  = int(data['Count'])

    PMIDs = []

    start_idx = 0
    batch = 500

    while start_idx < count:
        ret_range = '&retstart=' + str(start_idx) + '&retmax=' + str(batch)
        query_url = url + ret_range

        response = requests.get(query_url, headers=headers)

        if response.status_code != 200:
            print(response.status_code)
            break

        data = xmltodict.parse(response.content)['eSearchResult']
        ids = data['IdList']['Id']
        PMIDs.extend(ids)

        start_idx += batch

    PMIDs = [int(d) for d in PMIDs]
    return PMIDs

def remove_redundant(results):
    starts = [r['span']['begin'] for r in results]
    ends = [r['span']['end'] for r in results]

    dup_start = [i for i in starts if starts.count(i)>1]
    dup_end = [i for i in ends if ends.count(i)>1]

    dup_start = list(set(dup_start))
    dup_end = list(set(dup_end))

    to_remove = []

    for m in dup_start:
        idxs =  [i for i,j in enumerate(starts) if j==m]
        entries = [results[i] for i in idxs]

        longest = 0
        longest_entry = None

        for e in entries:
            length = e['span']['end'] = e['span']['begin']
            if length > longest:
                longest = length
                longest_entry = e

        for e_ in entries:
            if e_ != longest_entry:
                to_remove.append(e_)

    for n in dup_start:
        idxs =  [i for i,j in enumerate(ends) if j==n]
        entries = [results[i] for i in idxs]

        longest = 0
        longest_entry = None

        for e in entries:
            length = e['span']['end'] = e['span']['begin']
            if length > longest:
                longest = length
                longest_entry = e

        for e_ in entries:
            if e_ != longest_entry:
                to_remove.append(e_)

    for r in to_remove:
        results.remove(r)

    results = sorted(results, key = lambda x: x['span']['begin'])
    return results

def query_id(ids, session, headers):
    url = 'https://bern.korea.ac.kr/pubmed/' + ids
    try:
        return session.get(url, headers=headers).json()
    except:
        return [None] * len(ids)

def get_classifications(ids, headers):
    attribute_jsons = []
    s = requests.Session()

    url = 'https://bern.korea.ac.kr'
    s.post(url, headers=headers)

    batch = 10

    for idx in range(int(len(ids)/batch)):
        idx_tmp = idx * batch
        id_range = ids[idx_tmp:idx_tmp+batch]
        ids_tmp = [str(d) for d in id_range]
        ids_tmp = ','.join(ids_tmp)

        ner_list = query_id(ids_tmp, s, headers)
        # print(ner_list)
        attribute_jsons.extend(ner_list)

        if not idx_tmp % 100:
            print('~row', idx_tmp, '~')

    return pd.DataFrame(attribute_jsons)

def json_to_df(ner_list):
    attributes = []
    nlp = spacy.load('en_core_web_lg')

    for idx, ner in enumerate(ner_list):
        attrs = {'abstract':[], 'gene':[], 'disease':[], 'drug':[], 'species':[]}
        if not ner is None:
            res  = ner['denotations']
            text = ner['text']

            res = remove_redundant(res)

            colored_text = text

            print(res)
            for i, entry in enumerate(res):
                entity = entry['obj']
                st = entry['span']['begin']
                end = entry['span']['end']
                term = text[st:end]

                if entity in ['disease', 'gene', 'drug', 'species']:

                    st += i*12
                    end += i*12

                    if entity == 'disease':
                        colored_text = colored_text[:st] + " <bl> " +term+ ' <b> ' + colored_text[end:]
                    elif entity == 'gene':
                        colored_text = colored_text[:st] + " <gr> " +term+ ' <g> ' + colored_text[end:]
                    elif entity == 'drug':
                        colored_text = colored_text[:st] + " <rd> " +term+ ' <r> ' + colored_text[end:]
                    elif entity == 'species':
                        colored_text = colored_text[:st] + " <br> " +term+ ' <b> ' + colored_text[end:]

                    in_corpus = term.lower() in [s.lower() for s  in attrs[entity]]
                    singular_in_corpus  =  term[:len(term)-1].lower()  in[s.lower()for s in attrs[entity]]

                    doc1 = nlp(term)
                    if doc1.vector_norm == 0:
                        similar_term_in_corpus = False
                    else:
                        similarities = []
                        for w in attrs[entity]:
                            doc2 = nlp(w)
                            if doc2.vector_norm == 0:
                                similarities.append(0)
                            else:
                                similarities.append(doc1.similarity(doc2))
                        similar_term_in_corpus  = max(similarities) > 0.9
                    
                    if not (in_corpus or singular_in_corpus or similar_term_in_corpus):
                        attrs[entity].append(term)

            attrs.update((x, ', '.join(y)) for  x,y in attrs.items())
            attrs['abstract'] = colored_text

        attributes.append(attrs)
        if not idx%100:
            print("row", idx, "done.")

    return pd.DataFrame(attributes)

if __name__ == '__main__':
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_5_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36'}
    # pmids = get_pubmed_ids(headers)

    # df = pd.DataFrame(pmids, columns=['PMID'])
    # df.to_csv('pmids.csv', index=False)

    df = pd.read_csv('pmids.csv')
    pmids = list(df['PMID'].values)

    test = pmids[:10]
    # out = get_classifications(pmids, headers)
    out = get_classifications(test, headers)

    print(out.columns)

    # out = out[['sourcedb', 'sourceid', 'text', 'denotations']]
    # out.to_csv('bern_output.csv', index=False)