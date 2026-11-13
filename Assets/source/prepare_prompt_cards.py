"""Build ready-to-copy Egyptian Arabic image prompts from the asset guide.
Run from the project root. Does not generate images or modify application code.
Existing individual prompt cards are preserved.
"""
from pathlib import Path
import re

PROJECT = Path(__file__).resolve().parents[2]
GUIDE = PROJECT / 'docs' / 'How to Do Assets.md'
ASSETS = PROJECT / 'Assets'


def first_prompt(guide, heading):
    section = guide.split(heading, 1)[1]
    return re.search(r'```text\n(.*?)\n```', section, re.S).group(1)


def main():
    guide = GUIDE.read_text(encoding='utf-8')
    cards = []
    basic = [
        ('globe-reference', 'references/globe-reference.png', '16:9', '### 3.1', 'A', 'صورة مرجعية فقط؛ مش خريطة Texture.'),
        ('surface-reference', 'references/surface-reference.png', '16:9', '### 3.2', 'A', 'المرجع الرئيسي لشكل العالم.'),
        ('context-ui-reference', 'references/context-ui-reference.png', '16:9', '### 3.3', 'A', 'ارفع surface-reference المعتمدة؛ توزيع توضيحي فقط.'),
        ('nova-neutral', 'characters/nova-neutral.png', '1024×1024 PNG', '### 4.1', 'A', 'خلفية شفافة حقيقية؛ صورة نهائية للواجهة.'),
        ('alex-neutral', 'characters/alex-neutral.png', '1024×1024 PNG', '### 4.2', 'A', 'ارفع NOVA كمرجع للأسلوب، مش للهوية.'),
        ('maya-neutral', 'characters/maya-neutral.png', '1024×1024 PNG', '### 4.3', 'B', 'ارفع NOVA وAlex لتوحيد الأسلوب.'),
        ('mars-ground-basecolor', 'world/mars-ground-basecolor.jpg', '2048×2048', '### 8.1', 'A', 'خامة توضيحية؛ افحص تكرار الحواف قبل الاعتماد.'),
        ('logo', 'branding/logo.png', '1024×1024 PNG', '## 16.', 'C', 'الشعار اختياري؛ SVG محتاج Vector حقيقي.'),
    ]
    for slug, target, size, heading, batch, note in basic:
        cards.append((slug, target, size, batch, note, first_prompt(guide, heading)))
    for who in ['nova', 'alex', 'maya']:
        for mood, description in [('happy', 'فرح هادي بنجاح اكتشاف'), ('thinking', 'بتفكر بهدوء وفضول'), ('concerned', 'قلقان بشكل بسيط ومطمّن من غير خوف')]:
            cards.append((f'{who}-{mood}', f'characters/{who}-{mood}.png', '1024×1024 PNG', 'C', f'ارفع {who}-neutral.png نفسها كمرجع؛ ما تعيدش تصميم الشخصية.',
                          f'عدّل تعبير الشخصية المرفقة بس. خلي التعبير {description}. حافظ بالضبط على الهوية واللبس والألوان والكادر وحجم الرأس والإضاءة والشفافية. من غير كتابة أو إطار أو تصميم جديد.'))
    for i, slug in enumerate(['habitat', 'solar-array', 'life-support', 'greenhouse', 'laboratory', 'shelter', 'antenna', 'storage'], 1):
        description = first_prompt(guide, f'### 10.{i} ')
        description = re.split(r'صدّر', description)[0].strip()
        prompt = ('اعمل Concept art لصورة مرجعية واحدة، مش موديل نهائي. الجسم كامل من زاوية 3/4 علوية، خلفية رمادي فاتح بسيطة، stylized realism، أبيض دافي ورمادي غامق، من غير كتابة أو شعارات أو واجهة أو أرض كبيرة أو أجزاء مقصوصة. حافظ على مرجع الأسرة المرفق. وصف الجسم: ' + description)
        cards.append((f'{slug}-concept', f'references/{slug}-concept.png', '1536×1024 أو نفس النسبة', 'A' if i <= 3 else 'B', 'مرجع اختياري للنمذجة؛ الصورة لا تستبدل GLB. تجاهل أسماء Root/الأجزاء في الرسم لو الأداة لا تحتاجها.', prompt))
    props = {
        'rover': 'عربية Rover خيالية للأبحاث، 4 عجلات واضحة وماست وأدوات عينة، أبيض دافي ورمادي وألوان متناسقة مع القاعدة، حجم تقريبي 4×2.5×2.5 متر.',
        'rock-a': 'صخرة مريخ صغيرة غير منتظمة بحجم تقريبي 0.8 متر، بني وصدئي وخشنة.',
        'rock-b': 'صخرة مريخ متوسطة بحجم 1.5 متر، عريضة ومختلفة عن الصخرة الصغيرة.',
        'rock-c': 'كتلة صخرية أكبر حوالي 4 متر، طبقات وحواف طبيعية مقروءة.',
        'sample-rock': 'صخرة عينة بحجم نصف متر، طبقات مميزة واضحة من غير Glow أو تلوين صناعي.',
        'sample-case': 'حافظة عينة صغيرة بحجم 0.4 متر، غطاء ومقبض، أبيض ورمادي، من غير نص.',
        'crop-stages': 'ثلاث مراحل منفصلة جنب بعض لنفس إدخال نباتات صوبة 1×1 متر: شتلات صغيرة، نمو متوسط، نبات ورقي مكتمل. نفس الكادر والحوض، من غير كتابة أو ادعاء سرعة نمو علمية.',
        'walkway': 'وصلة ممر أرضية معيارية 4×2 متر ينفع تكرارها، تفاصيل هندسية بسيطة.',
        'landing-pad': 'منصة هبوط خيالية منخفضة قطرها 20 متر، مقروءة من فوق، من غير شعار أو كتابة.',
        'lander': 'مركبة هبوط خيالية ثابتة بحجم 8×8×7 متر، أرجل هندسية واضحة، متناسقة مع القاعدة.',
        'astronaut': 'رائد فضاء بالغ ببدلة ضغط ارتفاعه حوالي 1.8 متر، واقف بهدوء، من غير وجه تفصيلي.',
        'supply-crate': 'صندوق إمدادات 1×0.8×0.8 متر، أبيض ورمادي، من غير كتابة.',
    }
    for slug, subject in props.items():
        prompt = 'اعمل Concept art مرجعي للجسم التالي: ' + subject + ' أسلوب stylized realism متناسق مع الأسرة المعتمدة، شكل كامل من زاوية 3/4 على خلفية بسيطة، من غير كتابة أو شعارات أو واجهة. دي صورة مرجعية للنمذجة وليست GLB تفاعلي.'
        batch = 'C' if slug in ['walkway', 'landing-pad', 'lander', 'astronaut', 'supply-crate'] else 'B'
        cards.append((f'{slug}-concept', f'references/{slug}-concept.png', '1536×1024 أو نفس النسبة', batch, 'اختياري كمرجع؛ ملف الموديل ما زال مطلوب لو الأصل ضمن مشهد اللعبة.', prompt))
    out = ['# Prompts الصور الجاهزة', '', 'انسخ الـ Prompt الخاص بالصورة لأداة AI. ابدأ بالموسوم Batch A فقط؛ مراجع الموديلات اختيارية، ومش مطلوب توليد كل الصور مرة واحدة.', '',
           'المجلد الأساسي هو Assets. كل Prompt موجود كمان في ملف TXT منفصل داخل Assets/references/prompts. ما تعتبرش صورة Concept بديل GLB، ولا صورة خريطة مولدة بيانات علمية.', '']
    folder = ASSETS / 'references' / 'prompts'
    folder.mkdir(exist_ok=True)
    for index, (slug, target, size, batch, note, prompt) in enumerate(cards, 1):
        card = f'النتيجة: Assets/{target}\nالمقاس: {size}\nBatch: {batch}\n{note}\n\n{prompt}\n'
        path = folder / f'{slug}.txt'
        if not path.exists():
            path.write_text(card, encoding='utf-8')
        out += [f'## {index}. {slug} — Batch {batch}', '', f'احفظ: `Assets/{target}` · المقاس: `{size}`', '', note, '', '```text', prompt, '```', '']
    (PROJECT / 'docs' / 'Image Prompts.md').write_text('\n'.join(out), encoding='utf-8')
    print(f'{len(cards)} prompt cards prepared; images have NOT been generated.')


if __name__ == '__main__':
    main()
