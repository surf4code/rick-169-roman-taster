import re
R={"praegustator":"pry-goo-STAH-tor","Praegustator":"Pry-goo-STAH-tor","Halotus":"huh-LOH-tus","Locusta":"loh-KUS-tuh","Britannicus":"brih-TAN-ih-kus","Agrippina":"ag-rih-PEE-nuh","manumissio":"man-yoo-MISS-ee-oh"}
def respell(t):
    for k,v in R.items(): t=re.sub(r"\b"+k+r"(?=\W|s\b|$)",v,t)
    return t
