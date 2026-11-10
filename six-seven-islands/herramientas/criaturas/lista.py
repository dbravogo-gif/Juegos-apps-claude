# Lista de referencia de CRIATURAS.md (del PDF del autor, 2026-11-10): cada especie con sus formas,
# su quintil y su papel. La usa excel.py. Uso: python3 herramientas/criaturas/lista.py
import collections
P = {'AF': 'atacante físico', 'AE': 'atacante especial', 'TF': 'tanque físico', 'TE': 'tanque especial', 'EN': 'niveladas'}
B1 = """Wurmple 1EN, Cascoon 1TF, Dustox 2TE
Azurill 1TE, Marill 1EN, Azumarill 3EN
Pidove 1AF, Tranquill 2AF, Unfezant 3AF
Starly 1AF, Staravia 2AF, Staraptor 3AF
Venipede 1TF, Whirlipede 2TF, Scolipede 3AF
Ralts 1AE, Kirlia 1AE, Gardevoir 4AE
Lotad 1TE, Lombre 2TE, Ludicolo 4TE
Whismur 1EN, Loudred 2EN, Exploud 4EN
Trapinch 1AF, Vibrava 2EN, Flygon 4EN
Shinx 1AF, Luxio 2AF, Luxray 4AF
Lillipup 1AF, Herdier 2AF, Stoutland 4AF
Roggenrola 1TF, Boldore 2TF, Gigalith 4TF
Sandile 1AF, Krokorok 2AF, Krookodile 4AF
Gothita 1TE, Gothorita 2TE, Gothitelle 4TE
Solosis 1AE, Duosion 2AE, Reuniclus 4AE
Litwick 1AE, Lampent 2AE, Chandelure 4AE
Zubat 1EN, Golbat 3EN, Crobat 4EN
Spheal 1EN, Sealeo 3EN, Walrein 4TE
Budew 1AE, Roselia 3AE, Roserade 4AE
Tynamo 1EN, Eelektrik 3EN, Eelektross 4EN
Torchic 2AE, Combusken 3EN, Blaziken 4AF
Turtwig 2TF, Grotle 3TF, Torterra 4TF
Piplup 2AE, Prinplup 3AE, Empoleon 4AE
Aron 2TF, Lairon 3TF, Aggron 4TF
Slakoth 1AF, Vigoroth 3AF, Slaking 5AF
Bagon 2AF, Shelgon 3TF, Salamence 5AF
Gible 2AF, Gabite 3AF, Garchomp 5AF
Deino 2AF, Zweilous 3AF, Hydreigon 5AE"""
B2 = """Kricketot 1TF, Kricketune 2AF
Poochyena 1AF, Mightyena 3AF
Zigzagoon 1AF, Linoone 3AF
Taillow 1AF, Swellow 3AF
Shroomish 1TE, Breloom 3AF
Makuhita 1AF, Hariyama 3AF
Wingull 1AE, Pelipper 3TF
Electrike 1AE, Manectric 3AE
Barboach 1EN, Whiscash 3EN
Bidoof 1EN, Bibarel 3AF
Cherubi 1AE, Cherrim 3AE
Foongus 1EN, Amoonguss 3EN
Magikarp 1TF, Gyarados 4AF
Feebas 1TE, Milotic 4TE
Riolu 1AF, Lucario 4AE
Cottonee 1TF, Whimsicott 4TF
Petilil 1AE, Lilligant 4AE
Munna 1AE, Musharna 4AE
Carvanha 2AF, Sharpedo 3AF
Numel 2AE, Camerupt 3AE
Spoink 2TE, Grumpig 3TE
Cacnea 2AE, Cacturne 3AE
Corphish 2AF, Crawdaunt 3AF
Shellos 2EN, Gastrodon 3TE
Stunky 2EN, Skuntank 3EN
Deerling 2AF, Sawsbuck 3AF
Dwebble 2TF, Crustle 3TF
Trubbish 2EN, Garbodor 3TF
Joltik 2AE, Galvantula 3AE
Snorunt 2EN, Glalie 4EN
Buizel 2AF, Floatzel 4AF
Lileep 2TE, Cradily 4TE
Anorith 2AF, Armaldo 4AF
Cranidos 2AF, Rampardos 4AF
Shieldon 2TF, Bastiodon 4TF
Zorua 2AE, Zoroark 4AE
Bronzor 2TF, Bronzong 4TF
Elgyem 2AE, Beheeyem 4AE
Psyduck 2AE, Golduck 4AE
Drilbur 2AF, Excadrill 4AF
Darumaka 2AF, Darmanitan 4AF
Ferroseed 2TF, Ferrothorn 4TF"""
B3 = "Sableye 2EN|Mawile 2TF|Spinda 2EN|Luvdisc 2EN|Skarmory 3TF|Torkoal 3TF|Zangoose 3AF|Absol 3AF|Seviper 3AE|Plusle 3AE|Minun 3AE|Lunatone 3AE|Solrock 3AF|Audino 3EN|Heracross 4AF|Pinsir 4AF|Sigilyph 4AE|Cryogonal 4TE|Spiritomb 4EN|Lapras 4EN"
B4 = "Groudon 5AF|Zekrom 5AF|Kyogre 5AE|Dialga 5AE|Reshiram 5AE|Latios 5AE|Regirock 5TF|Cobalion 5TF|Regice 5TE|Cresselia 5TE|Rayquaza 5EN|Giratina 5EN"
def forma(t):
    n, c = t.strip().rsplit(' ', 1)
    return n, int(c[0]), c[1:]
bloques = [
  ('De 3 formas', [l.split(', ') for l in B1.splitlines()]),
  ('De 2 formas', [l.split(', ') for l in B2.splitlines()]),
  ('Sin evolución', [[t] for t in B3.split('|')]),
  ('Legendarias', [[t] for t in B4.split('|')]),
]
INICIALES = {'Torchic', 'Turtwig', 'Piplup', 'Aron'}
def markdown():
    """La lista en tablas de Markdown, como en CRIATURAS.md."""
    out = []; n = 0; total = 0; q = collections.Counter(); p = collections.Counter()
    for titulo, especies in bloques:
        especies_l = [e for e in especies if forma(e[0])[0] not in INICIALES]
        formas = sum(len(e) for e in especies_l)
        out.append(f"\n### {titulo} ({len(especies_l)} especies, {formas} criaturas)\n\n| Nº | Referencia: forma (quintil, papel) | Especie nuestra |\n| --- | --- | --- |")
        for e in especies:
            n += 1
            fs = [forma(t) for t in e]
            if fs[0][0] in INICIALES: continue  # las iniciales van aparte, con estadísticas propias
            for _, qq, pp in fs: q[qq] += 1; p[pp] += 1; total += 1
            txt = ' → '.join(f"{a} (Q{b}, {c})" for a, b, c in fs)
            out.append(f"| {n} | {txt} |  |")
    assert total == 188 and n == 102, (total, n)
    return '\n'.join(out) + '\n'


if __name__ == '__main__':
    print(markdown())
