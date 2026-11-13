# شغّل أول موديلات Blender مباشرة

ده طريق أسهل من نمذجة كل حاجة يدويًا، ومش محتاج MCP. المطلوب تثبيت Blender من [الموقع الرسمي](https://www.blender.org/download/) حسب القسم 5 في [الدليل](How%20to%20Do%20Assets.md).

## اللي اتجهّز

الملف [build_batch_a.py](../Assets/source/build_batch_a.py) مكتوب بالفعل. بيجهّز نماذج إجرائية توضيحية للمراجعة، مش أصول نهائية معتمدة. **اتراجع من ناحية Python syntax فقط؛ ما اتشغّلش فعليًا لأن Blender مش متثبت هنا.**

الإعداد الافتراضي بيعمل **Habitat واحد**. بعد ما نراجع شكله، تقدر تختار Batch A عشان يعمل Habitat وSolarArray وLifeSupport والأرض. باقي الأصول لها طلبات تفصيلية في دليل الأصول؛ مش متولدة في الـ Script ده.

## أول تشغيل — Habitat بس

1. افتح Blender، وافتح ملف جديد `General` واحفظه في `Assets/source/mars-assets.blend`.
2. اختار Workspace اسمه `Scripting` من الشريط اللي فوق.
3. في Text Editor جوّه Blender اختار `Text → Open`، وافتح:

```text
C:\Users\mahmo\Downloads\marsastro\Assets\source\build_batch_a.py
```

4. راجع سطر `ASSETS` في أول الملف؛ لازم يشاور على مجلد المشروع الحالي.
5. خلّي السطر ده زي ما هو:

```python
BUILD = 'habitat'
```

6. خلّي `RENDER_PREVIEWS = True` عشان يطلع صورتين للمراجعة.
7. اضغط `Run Script` أو `Alt+P` والمؤشر جوّه Text Editor.
8. استنى التصدير وRender الصورتين. ما تشغّلوش مرة تانية أثناء التشغيل.
9. افتح File Explorer وراجع الملفات اللي المفروض تظهر:

```text
Assets/buildings/habitat.glb
Assets/source/habitat-draft.blend
Assets/previews/habitat-perspective.png
Assets/previews/habitat-top.png
Assets/previews/habitat-draft-report.json
```

10. الصور والتقرير أول نتيجة نراجعها. لو فيه Error قبل اكتمالها، افتح `Window → Toggle System Console` في Windows، وانسخ نص الخطأ وابعتهولي. وجود GLB وحده مش معناه إن التصدير والـ Preview والفحص كلهم نجحوا.

الـ Script بيشتغل في Scene مؤقتة وبيحاول يرجّعك للـ Scene الأصلية، فطبيعي ما تلاقيش الموديل فضل ظاهر في ملفك المفتوح. افتح `habitat-draft.blend` عشان تعدله، أو استورد GLB في ملف فاضي. مش بيستبدل مخرجات موجودة: لو GLB أو مصدر الـ Draft موجود، بيطبع `SKIP`.

## بعد مراجعة Habitat — باقي Batch A

1. ارجع لملف الـ Script في Text Editor.
2. غيّر سطر واحد:

```python
BUILD = 'batch-a'
```

3. احفظ نسخة الـ Script لو عدّلته، وبعدها `Run Script`.
4. هيتخطى Habitat الموجود، ويحاول يطلع:

```text
Assets/buildings/solar-array.glb
Assets/buildings/life-support.glb
Assets/world/mars-region.glb
```

ومصدر `*-draft.blend` وصورتين وتقرير لكل واحد. الأرض حوالي 512×512 متر، إجرائية وليست NASA terrain. خامتها لون توضيحي لو ملف `Assets/world/mars-ground-basecolor.jpg` لسه مش موجود. لو الخامة موجودة قبل توليد الأرض، الـ Script بيحاول يضمّنها في الخامة والتصدير.

## التعديلات وإعادة الإنتاج

- لو عايز تعديل فني، الأفضل تعدّل مصدر Blender وتصدّر نسخة مراجعة جديدة؛ ما تمسحش شغلك عشان تعيد توليد شكل آلي كل مرة.
- لو محتاج تعيد تشغيل مولّد أصل بعينه، احتفظ بنسخة من مخرجاته القديمة وانقلها لمجلد مراجعة داخل `Assets` الأول. الـ Script بيتعمد ما يعملش Overwrite تلقائي.
- لو محتاج غير Batch A، استخدم طلب الأصل من [How to Do Assets.md](How%20to%20Do%20Assets.md) مع Blender MCP بعد توصيله. مش مطلوب منك تكتب Blender Python بنفسك.
- مسار إنشاء الأصول ده ما بيعدّلش التطبيق أو يثبّت Packages أو يوصل MCP تلقائيًا.

## تجهيز نسخة خريطة 4K جوّه Blender

الخريطة الأصلية نزلت بالفعل في `Assets/source/8k_mars.jpg`، فمش لازم تنزّلها تاني. عشان تجهّز النسخة الأخف من غير MCP:

1. افتح مساحة `Image Editor` في Blender.
2. `Image → Open`، واختار `Assets/source/8k_mars.jpg`.
3. `Image → Resize` أو أمر تغيير حجم الصورة حسب الإصدار؛ خلي العرض `4096` والارتفاع `2048`، من غير Crop أو تغيير النسبة.
4. `Image → Save As`، واختار JPEG وRGB وجودة حوالي 90، واحفظ `Assets/world/mars-global-color-4k.jpg`. سيب الأصل 8K زي ما هو.
5. راجع المقاس الفعلي بعد الحفظ، وسجّل في Manifest إن دي نسخة مصغّرة من أصل Solar System Scope تحت CC BY 4.0، مش خريطة NASA خام.

الخطوات دي لسه محتاجة تنفيذ منك في Blender؛ وجود الأصل 8K مش معناه إن نسخة 4K اتعملت تلقائيًا.

## مراجعة النتيجة

ابعت صور الـ Preview والتقارير، أو قولّي إنها ظهرت في Assets. هنراجع الشكل، المقاس، الأجزاء، الخامات، GLB، وأداء العرض قبل ما نعتبرها جاهزة. ما تعتبرش النماذج الإجرائية موافقة تلقائية على الأسلوب النهائي اللي طلبته.
