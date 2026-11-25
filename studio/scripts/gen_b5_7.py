import json
T="taster_protagonist"
SC={"britannicus":0.8,"child_titus":0.75,"child_octavia":0.75,"child_gaius":0.75}
XS={1:[0],2:[-1.5,1.5],3:[-2.1,0,2.1],4:[-2.6,-0.9,0.9,2.6]}
def pl(n): return XS[n]
def sh(n,s,c,ch=(),cr=(),hero=None,tags=(),bubble=None,stamp=None,night=False,note=""):
    d={"narration":n,"set":s,"grade":"night_torch" if night or s=="palace_kitchen_night" else "day","camera":c}
    xs=pl(len(ch)) if ch else []
    d["characters"]=[{"id":i,"pos":[x,0,0.0],"scale":SC.get(i,0.85),"emotion":e} for (i,e),x in zip(ch,xs)]
    if cr:
        cx=[-3.0,3.0,0.0,-1.6,1.6]
        d["crowd"]=[{"id":i,"pos":[cx[k],0,-2.8 if k<2 else -3.4],"scale":0.7,"emotion":e} for k,(i,e) in enumerate(cr)]
    if hero:
        t,sc,*o=hero; h={"t":t,"pos":[0.0,0.9,-0.8],"scale":sc}
        if t=="Platter": h["o"]={"kind":o[0]}
        if t=="Goblet" and o and o[0]=="tip": h["anim"]="tip"
        d["hero"]=h
    if tags: d["tags"]=[{"who":w,"text":tx,"color":co,"at":0.6} for w,tx,co in tags]
    if bubble: d["bubble"]={"who":bubble[0],"text":bubble[1],"at":0.5}
    if stamp: d["stamp"]=stamp
    d["notes"]=note
    return d
def info(n,c,title,stat,sub,items,note=""):
    return {"type":"infographic_card","camera":c,"narration":n,"infographic":{"title":title,"stat":stat,"sub":sub,"items":items},"notes":note}
def akira(n,c,ex): return {"type":"akira_cutaway","camera":c,"narration":n,"akiraExpression":ex,"bubble":{"text":n},"notes":"Script AKIRA cutaway."}
BQ,BH,BK,BN,BS="banquet_hall_day","palace_quarters_day","children_table_day","palace_corridor_day","tasters_room_day"
PUR="#7C3AED";BLU="#2563EB";TEAL="#0F766E";AMB="#B45309";ROSE="#BE123C";GRN="#15803D"
B5=[
sh("In the year 54, according to Roman writers, Claudius sits down to a dish of mushrooms. His favourite.",BQ,"crane_down",[("claudius","happy_relief"),("halotus","skeptical")],hero=("Platter",1.2,"mushroom"),stamp="AD 54",tags=[(0,"CLAUDIUS",PUR)],note="Claudius delighted, Halotus unreadable (same face as B04)."),
sh("His taster is Halotus. What happens next depends on who you ask, and the Romans themselves couldn't agree.",BQ,"punch_in",[("halotus","skeptical"),("claudius","curious")],tags=[(0,"HALOTUS",AMB)]),
info("Version one comes from Tacitus. A woman named Locusta, a specialist in exactly this kind of problem,","top_down_drift","WHO POISONED CLAUDIUS?","4 versions","every one is an allegation",["Tacitus","Suetonius, take one","Suetonius, take two","The doctor"],"Script cue infographic."),
sh("allegedly prepares poison for the empress Agrippina. And Halotus serves it.",BH,"whip_right",[("locusta","skeptical"),("agrippina","confident_point")],tags=[(0,"LOCUSTA",GRN),(1,"AGRIPPINA",ROSE)],note="Implied only, no vial or method shown."),
sh("Version two comes from Suetonius. It's Halotus again, at a banquet with the priests.",BQ,"orbit",[("halotus","skeptical")],cr=[("servant_a","curious"),("servant_b","curious")],hero=("Platter",1.2,"mushroom")),
sh("Version three also comes from Suetonius, who apparently couldn't pick. There's no banquet.",BH,"slow_push",[("scribe","shrug_question")],tags=[(0,"SUETONIUS",TEAL)]),
sh("It's a family dinner, and Agrippina serves Claudius the mushrooms herself.",BQ,"low_angle_tilt",[("agrippina","confident_point"),("claudius","happy_relief")],hero=("Platter",1.2,"mushroom")),
sh("And one more account puts the blame on the emperor's doctor.",BH,"dutch_punch",[("physician","nervous_sweat"),("claudius","happy_relief")],tags=[(0,"DOCTOR","#3B82F6")]),
sh("One emperor, one plate of mushrooms, and at least three versions of the evening.",BQ,"macro_push",[],hero=("Platter",1.45,"mushroom")),
sh("Every one of them is an allegation. None of them is a verdict.",BH,"punch_in",[("scribe","skeptical"),(T,"skeptical")]),
sh("For someone in your line of work, though, the versions share one uncomfortable detail.",BQ,"slow_push",[(T,[[0,"curious"],[3.0,"nervous_sweat"]])]),
sh("In two of the three, the poison allegedly goes through the emperor's own taster.",BQ,"corridor_dolly",[("halotus","skeptical"),("claudius","happy_relief")],hero=("Goblet",1.2)),
sh("The man who tested you. The job that is supposed to stop this exact thing",BQ,"fly_through",[(T,"shocked"),("halotus","skeptical")]),
sh("is standing right in the middle of it.",BQ,"orbit",[(T,"nervous_sweat"),("halotus","skeptical"),("claudius","happy_relief")]),
akira("Three versions. Zero confessions.","whip_right","smirk"),
sh("Where are you that night? Close enough to see. Not close enough to know.",BQ,"slow_push",[(T,[[0,"curious"],[2.8,"nervous_sweat"]])],cr=[("claudius","happy_relief"),("halotus","skeptical")]),
sh("You see Claudius eat. You see him go quiet. You see him helped away from the table.",BQ,"top_down_drift",[("claudius",[[0,"happy_relief"],[2.0,"sad_slump"]]),(T,"shocked")],cr=[("servant_a","nervous_sweat"),("servant_b","nervous_sweat")]),
sh("And you see Halotus, standing exactly where a taster stands, with exactly the face he always has.",BQ,"low_angle_tilt",[(T,"nervous_sweat"),("halotus","skeptical")]),
sh("According to the Roman writers, Claudius never recovers. Whether it was poison, and whose, is something nobody will ever settle.",BH,"slowmo_impact",[("claudius","sad_slump"),("physician","nervous_sweat")]),
sh("Remember that joke about the empire changing hands before dessert? It turns out it wasn't much of a joke.",BQ,"crane_down",[(T,[[0,"skeptical"],[3.5,"nervous_sweat"]])]),
sh("The new emperor is young Nero, Agrippina's son. He's relaxed. He smiles a lot.",BQ,"whip_right",[("nero","happy_relief"),("agrippina","confident_point")],tags=[(0,"NERO",PUR),(1,"AGRIPPINA",ROSE)]),
sh("And later, he makes a little joke about the whole affair. Mushrooms, he says, are \"the food of the gods.\"",BQ,"punch_in",[("nero","talking_animated")],cr=[("servant_a","nervous_sweat"),(T,"nervous_sweat")],hero=("Platter",1.2,"mushroom"),bubble=(0,"FOOD OF THE GODS")),
sh("Let that sit for a second. Then stop thinking about it, because you work here,",BH,"slow_push",[(T,[[0,"thinking_chin"],[3.0,"nervous_sweat"]])]),
sh("and thinking is how people stop working here.",BN,"dutch_punch",[(T,"nervous_sweat"),("palace_guard","angry_glare")]),
sh("As for Halotus, according to ancient sources, he isn't punished. He keeps his post.",BQ,"crane_down",[("halotus","skeptical")],cr=[("palace_guard","skeptical")]),
sh("He just goes on tasting, for the new emperor now, with the same calm face.",BQ,"low_angle_tilt",[("halotus","skeptical"),("nero","happy_relief")],hero=("Goblet",1.2)),
sh("You get a new post too. It's the best thing that ever happens to you. Give it a few months.",BH,"corridor_dolly",[(T,[[0,"happy_relief"],[4.6,"nervous_sweat"]]),("mother","happy_relief")]),
]
B6=[
sh("You're assigned to the children's table.",BK,"whip_right",[(T,"curious")],cr=[("child_octavia","happy_relief"),("child_gaius","happy_relief")],stamp="AD 54 - AGE 23"),
sh("In the palace, the imperial children eat at their own table, a plainer one, set where the family can see them.",BK,"crane_down",[("child_titus","happy_relief"),("child_octavia","happy_relief")],cr=[("nero","happy_relief"),("agrippina","skeptical")],hero=("Bowl",1.0)),
sh("Simpler dishes, smaller cups. And every bite, every drink, is tested by a taster",BK,"macro_push",[],hero=("Bowl",1.4)),
sh("chosen from the prince's own attendants. That's you now.",BK,"slow_push",[(T,"confident_point")],cr=[("child_gaius","happy_relief")],tags=[(0,"TASTER",BLU)]),
sh("Your table is plainer, but it isn't private. The children eat in full view of the family,",BK,"top_down_drift",[(T,"nervous_sweat")],cr=[("agrippina","skeptical"),("nero","happy_relief")]),
sh("which means every bite you take is watched by the most powerful people in Rome.",BK,"punch_in",[(T,"nervous_sweat")],cr=[("agrippina","skeptical"),("nero","skeptical"),("palace_guard","skeptical")]),
sh("You learn to taste with your whole face perfectly still. A frown could start a panic. A smile could start a rumour.",BK,"low_angle_tilt",[(T,[[0,"neutral"],[4.0,"focused_reading"]])],cr=[("servant_a","nervous_sweat")]),
sh("The prince is Britannicus. He's thirteen, he's the late emperor's son,",BK,"orbit",[("britannicus","happy_relief"),(T,"curious")],tags=[(0,"BRITANNICUS","#38BDF8")]),
sh("and he is the first person you've ever tasted for who actually says thank you.",BK,"slow_push",[("britannicus","happy_relief"),(T,"embarrassed_blush")],bubble=(0,"THANK YOU!")),
sh("He's polite. He asks your name. He remembers it the next day, which in this building is practically a scandal.",BK,"whip_right",[("britannicus","talking_animated"),(T,[[0,"surprised_jump"],[2.5,"happy_relief"]])],cr=[("servant_a","shocked"),("servant_b","shocked")]),
sh("He likes his drinks hot. So you test them hot. You burn your tongue about once a week.",BK,"macro_push",[(T,"nervous_sweat"),("britannicus","happy_relief")],hero=("Goblet",1.3)),
sh("It's the only workplace injury of your career you're happy to have.",BK,"punch_in",[(T,"happy_relief"),("britannicus","happy_relief")]),
sh("Sometimes he sings. Not for an audience. Not for anyone important. Just a boy singing at a table,",BK,"crane_down",[("britannicus","talking_animated"),(T,"happy_relief")],cr=[("child_octavia","happy_relief")]),
sh("while the adults around him go suspiciously quiet.",BK,"slow_push",[("britannicus","talking_animated"),(T,"nervous_sweat")],cr=[("nero","skeptical"),("agrippina","skeptical"),("servant_a","nervous_sweat")]),
sh("You never learn the words. You don't need to. You just know it's the best sound in the building.",BK,"orbit",[(T,"happy_relief"),("britannicus","talking_animated")]),
sh("For a while, life at the plainer table is good. The food is simple. The danger feels far away.",BK,"fly_through",[(T,"happy_relief")],cr=[("child_titus","happy_relief"),("child_octavia","happy_relief")],hero=("Bowl",1.1)),
sh("You start to think the children's table might be the safest posting in the palace. Who would bother with a kid?",BK,"top_down_drift",[(T,[[0,"thinking_chin"],[3.5,"happy_relief"]]),("britannicus","happy_relief")]),
sh("You do notice how the grown-up table watches the little one.",BK,"low_angle_tilt",[(T,"skeptical")],cr=[("nero","happy_relief"),("agrippina","skeptical")]),
sh("Nero laughs easily. His smile reaches everyone in the room. It's just hard to tell what's behind it.",BQ,"punch_in",[("nero","happy_relief"),(T,"nervous_sweat")]),
sh("Your mother says you look happier. She's right. These are your best months.",BH,"slow_push",[("mother","happy_relief"),(T,"happy_relief")]),
sh("And then it's the year 55. An ordinary dinner. Ordinary hot drinks. And an ordinary jug of cold water.",BK,"macro_push",[(T,[[0,"neutral"],[4.0,"nervous_sweat"]])],hero=("Jug",1.4)),
]
N=True
B7=[
sh("This is the evening as Tacitus tells it.",BQ,"crane_down",[("scribe","focused_reading")],tags=[(0,"TACITUS",TEAL)],stamp="AD 55 - AGE 24",night=N),
sh("The family is at the main table. The children are at theirs.",BK,"top_down_drift",[("britannicus","happy_relief")],cr=[("nero","happy_relief"),("agrippina","happy_relief"),("child_octavia","happy_relief")],night=N),
sh("You're standing where you always stand, beside Britannicus, close enough to reach his cup.",BK,"slow_push",[(T,"focused_reading"),("britannicus","happy_relief")],hero=("Goblet",1.1),night=N),
sh("He's in a good mood. He's been talking all evening, about nothing much, the way thirteen-year-olds do.",BK,"orbit",[("britannicus","talking_animated"),(T,"happy_relief")],night=N),
sh("You've heard every story twice. You don't mind.",BK,"low_angle_tilt",[(T,"happy_relief"),("britannicus","talking_animated")],night=N),
sh("A drink arrives for him. It's very hot. Steam rises off the top.",BK,"macro_push",[(T,"curious"),("servant_a","neutral")],hero=("Goblet",1.4),night=N),
sh("You taste it first, the way you always do. It burns, the way it always does. Then you wait.",BK,"punch_in",[(T,[[0,"focused_reading"],[3.5,"nervous_sweat"]])],hero=("Goblet",1.2),night=N),
sh("Nothing happens. It's harmless. You know it is, because you're still standing. You hand it to him.",BK,"slow_push",[(T,[[0,"neutral"],[2.5,"happy_relief"]]),("britannicus","happy_relief")],night=N),
sh("Around you, the dinner carries on. Cups clink at the main table. Somebody laughs at something.",BK,"fly_through",[(T,"focused_reading")],cr=[("nero","talking_animated"),("agrippina","happy_relief"),("servant_b","happy_relief")],night=N),
sh("A servant crosses behind you with a tray.",BK,"corridor_dolly",[(T,"neutral")],cr=[("servant_b","neutral")],night=N),
sh("It's the kind of evening you've stood through a hundred times, the kind you'd forget by morning.",BK,"top_down_drift",[(T,[[0,"happy_relief"],[3.5,"neutral"]]),("britannicus","happy_relief")],night=N),
sh("Britannicus lifts the cup, and puts it straight back down. Too hot, he says.",BK,"punch_in",[("britannicus",[[0,"curious"],[2.0,"skeptical"]]),(T,"curious")],hero=("Goblet",1.2),bubble=(0,"TOO HOT."),night=N),
sh("That's normal. Hot drinks get cooled down. That's what the water is for.",BK,"orbit",[(T,"neutral"),("britannicus","neutral")],hero=("Jug",1.2),night=N),
sh("The jug. The cup. The wait.",BK,"macro_push",[],cr=[("servant_a","neutral")],hero=("Jug",1.5),night=N,note="MACRO: jug, cup, a hand at the edge of frame. No pouring detail."),
sh("It's the same kind of jug you carried as a child. The jug you stopped seeing years ago.",BK,"dutch_punch",[(T,"nervous_sweat"),("britannicus","happy_relief")],hero=("Jug",1.3),night=N),
sh("Britannicus drinks. He goes quiet. He slumps at the table. He doesn't get up.",BK,"slowmo_impact",[("britannicus",[[0,"happy_relief"],[1.4,"sad_slump"]]),(T,[[0,"focused_reading"],[1.8,"shocked"]])],night=N,note="By implication only."),
sh("At the main table, Nero stays where he is. He tells the guests it's nothing to worry about.",BK,"low_angle_tilt",[("nero","confident_point")],cr=[("agrippina","skeptical"),("servant_a","shocked")],night=N),
sh("Just one of Britannicus's epileptic fits.",BK,"whip_right",[("nero","talking_animated"),(T,"shocked")],bubble=(0,"JUST A FIT."),night=N),
sh("You're still standing beside the empty space where the cup was. Your mouth still tastes of the hot drink. You're fine.",BK,"slow_push",[],cr=[(T,"sad_slump")],hero=("Goblet",1.4,"tip"),night=N,note="Slow push on the empty cup, characters out of focus."),
sh("That's when you understand. And it's worse than you think.",BK,"dutch_punch",[(T,[[0,"shocked"],[2.4,"nervous_sweat"]])],night=N),
sh("Tacitus gives a reason for the way it was done. It was arranged, in his words,",BS,"orbit",[("scribe","focused_reading"),(T,"skeptical")],night=N),
info("so that \"the usage might not be dropped or the crime betrayed by the death of both prince and attendant.\"","slow_push","TACITUS ON THE PLAN","1 attendant","why the taster had to live",["Keep the usage","Hide the crime","The prince dies","The attendant lives"],"Quote from the research doc."),
sh("The attendant is you. Not you by name. Nobody needed your name.",BK,"punch_in",[(T,[[0,"shocked"],[2.4,"sad_slump"]])],night=N),
sh("Just the role. The taster. The one who has to be standing at the end.",BK,"low_angle_tilt",[(T,"sad_slump")],cr=[("nero","skeptical"),("agrippina","skeptical")],night=N),
sh("The plan didn't go around you. It was built around you.",BK,"crane_down",[(T,"shocked")],cr=[("nero","skeptical"),("agrippina","skeptical")],night=N),
sh("If you had fallen too, everyone would have known. So you had to live. Your survival was the cover story.",BK,"top_down_drift",[(T,[[0,"nervous_sweat"],[4.0,"sad_slump"]])],night=N),
sh("You think of the old tasters and their story about the poisoned flowers.",BS,"slow_push",[(T,"sad_slump"),("taster_felix","happy_relief"),("taster_hilarus","happy_relief")],night=N,note="Memory: they laugh, YOU do not."),
sh("Being careful was never the same as being safe. Now you know exactly how far apart those two things are.",BS,"punch_in",[(T,"sad_slump")],night=N),
sh("That same night, Britannicus is cremated. Fast. Quiet. Done before morning.",BN,"corridor_dolly",[("servant_a","sad_slump"),("servant_b","sad_slump")],cr=[("palace_guard","neutral")],night=N),
sh("You go back to your quarters. Your mother is waiting. She doesn't ask what happened. She already knows.",BH,"crane_down",[(T,"sad_slump"),("mother","sad_slump")],night=N),
sh("She taught you the rule herself: be somewhere else when things go wrong. Tonight, you weren't somewhere else.",BH,"slow_push",[("mother",[[0,"confident_point"],[3.5,"sad_slump"]]),(T,"sad_slump")],night=N),
]
out=[];
for b,L in ((5,B5),(6,B6),(7,B7)):
    for i,s in enumerate(L,1):
        s={"id":f"B{b:02d}_S{i:02d}",**s}; out.append(s)
CY=["slow_push","punch_in","orbit","crane_down","whip_right","low_angle_tilt","top_down_drift","corridor_dolly","dutch_punch","fly_through"]
prev="macro_push"
for s in out:
    if s["camera"]==prev:
        s["camera"]=next(c for c in CY if c!=prev and c!=s["camera"])
    prev=s["camera"]
json.dump(out,open("out/shots_b5_7.json","w"),indent=1,ensure_ascii=False)
print(len(out),sum(len(s['narration'].split())>22 for s in out))
