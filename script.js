// --- الحصول على العناصر الأساسية للنموذج (تأكد من وجودها كلها) ---
const retirementAgeInput = document.getElementById('retirementAge');
const genderSelect = document.getElementById('gender');
const avgSalary36Input = document.getElementById('avgSalary36'); // لـ 3 سنوات (جديد شيخوخة)
const avgSalary60Input = document.getElementById('avgSalary60'); // لـ 5 سنوات (جديد مبكر)
const avgSalaryOldSystemInput = document.getElementById('avgSalaryOldSystem'); // للقديم (سنتين/3سنوات)

const avgSalary36Group = document.getElementById('avgSalary36Group');
const avgSalary60Group = document.getElementById('avgSalary60Group');
const avgSalaryOldSystemGroup = document.getElementById('avgSalaryOldSystemGroup'); // العنصر الجديد

const calculateBtn = document.getElementById('calculateBtn');
const resultSpan = document.getElementById('result');
const subscriptionsCountInput = document.getElementById('subscriptionsCount'); // هذا العنصر الجديد الذي سيتأثر بوجوده
const dependentsCountInput = document.getElementById('dependentsCount');
const firstSubscriptionDateInput = document.getElementById('firstSubscriptionDate');
const isOldSystemEligibleSelect = document.getElementById('isOldSystemEligible');

const OLD_SYSTEM_DATE_THRESHOLD = new Date('2014-03-01T00:00:00'); // تاريخ 1/3/2014

// --- 1. دالة الحصول على نسبة الخصم من الجدول (تبقى كما هي) ---
function getEarlyRetirementDiscountPercentage(age, gender) {
    let discount = 0;

    if (gender === 'male') {
        if (age >= 45 && age < 46) { discount = 0.20; }
        else if (age >= 46 && age < 47) { discount = 0.18; }
        else if (age >= 47 && age < 48) { discount = 0.16; }
        else if (age >= 48 && age < 49) { discount = 0.14; }
        else if (age >= 49 && age < 50) { discount = 0.12; }
        else if (age >= 50 && age < 51) { discount = 0.11; }
        else if (age >= 51 && age < 52) { discount = 0.10; }
        else if (age >= 52 && age < 53) { discount = 0.09; }
        else if (age >= 53 && age < 54) { discount = 0.08; }
        else if (age >= 54 && age < 55) { discount = 0.07; }
        else if (age >= 55 && age < 56) { discount = 0.06; }
        else if (age >= 56 && age < 57) { discount = 0.05; }
        else if (age >= 57 && age < 58) { discount = 0.04; }
        else if (age >= 58 && age < 59) { discount = 0.03; }
        else if (age >= 59 && age < 60) { discount = 0.02; }
    } else if (gender === 'female') {
        if (age >= 45 && age < 46) { discount = 0.14; }
        else if (age >= 46 && age < 47) { discount = 0.12; }
        else if (age >= 47 && age < 48) { discount = 0.10; }
        else if (age >= 48 && age < 49) { discount = 0.08; }
        else if (age >= 49 && age < 50) { discount = 0.06; }
        else if (age >= 50 && age < 51) { discount = 0.04; }
        else if (age >= 51 && age < 52) { discount = 0.02; }
    }
    return discount;
}

// --- 2. دالة تحديث عرض حقول معدل الراتب بناءً على العمر والجنس والنظام ---
function updateSalaryFieldsVisibility() {
    const age = parseInt(retirementAgeInput.value);
    const gender = genderSelect.value;
    const subsCount = parseInt(subscriptionsCountInput.value); // إضافة هذا المتغير
    const firstSubDate = new Date(firstSubscriptionDateInput.value);
    const isOldSystemEligible = isOldSystemEligibleSelect.value;

    // إخفاء جميع حقول معدل الراتب مبدئياً
    avgSalary36Group.style.display = 'none';
    avgSalary60Group.style.display = 'none';
    avgSalaryOldSystemGroup.style.display = 'none';

    // إعادة ضبط الحقول المطلوبة ومسح القيم
    avgSalary36Input.removeAttribute('required'); avgSalary36Input.value = '';
    avgSalary60Input.removeAttribute('required'); avgSalary60Input.value = '';
    avgSalaryOldSystemInput.removeAttribute('required'); avgSalaryOldSystemInput.value = '';

    // التحقق الأساسي قبل عرض أي حقول:
    // يجب أن تكون هذه الحقول كلها مملوءة لكي تظهر حقول معدل الراتب
    if (
        isNaN(age) || age <= 0 ||
        gender === '' ||
        isNaN(subsCount) || subsCount <= 0 || // إضافة التحقق من عدد الاشتراكات
        isNaN(firstSubDate.getTime()) || firstSubscriptionDateInput.value === '' || // التأكد من أن التاريخ المدخل صالح وغير فارغ
        isOldSystemEligible === ''
    ) {
        return; // لا تفعل شيئاً إذا لم يتم ملء جميع الحقول الأساسية
    }

    let retirementAgeThreshold = (gender === 'male') ? 60 : 55;
    const isEarlyRetirement = (age < retirementAgeThreshold); // هل التقاعد مبكر؟

    // تحديد ما إذا كان النظام "القديم" ينطبق بناءً على تاريخ أول اشتراك والتحقق اليدوي
    let applyOldSystemRules = false;
    if (firstSubDate < OLD_SYSTEM_DATE_THRESHOLD && isOldSystemEligible === 'yes') {
        applyOldSystemRules = true;
    }

    if (applyOldSystemRules) {
        // إذا كان النظام القديم ينطبق
        avgSalaryOldSystemGroup.style.display = 'block';
        avgSalaryOldSystemInput.setAttribute('required', 'required');
    } else {
        // إذا كان النظام الجديد ينطبق
        if (isEarlyRetirement && age >= 45) { // التقاعد المبكر في النظام الجديد يتطلب عمر >= 45
            avgSalary60Group.style.display = 'block';
            avgSalary60Input.setAttribute('required', 'required');
        } else if (!isEarlyRetirement && age > 0) { // تقاعد شيخوخة في النظام الجديد
            avgSalary36Group.style.display = 'block';
            avgSalary36Input.setAttribute('required', 'required');
        }
    }
}

// --- الاستماع لتغييرات حقول العمر والجنس وعدد الاشتراكات وتاريخ أول اشتراك والنظام ---
retirementAgeInput.addEventListener('input', updateSalaryFieldsVisibility);
genderSelect.addEventListener('change', updateSalaryFieldsVisibility);
subscriptionsCountInput.addEventListener('input', updateSalaryFieldsVisibility); // جديد: الاستماع لتغيير عدد الاشتراكات
firstSubscriptionDateInput.addEventListener('change', updateSalaryFieldsVisibility);
isOldSystemEligibleSelect.addEventListener('change', updateSalaryFieldsVisibility);


// --- 3. دالة حساب المعاش عند الضغط على الزر (تبقى كما هي في الأغلب) ---
calculateBtn.addEventListener('click', function(event) {
    event.preventDefault();

    // --- أ. الحصول على جميع القيم المدخلة ---
    const subsCount = parseFloat(subscriptionsCountInput.value);
    const dependents = parseInt(dependentsCountInput.value);
    const retirementAge = parseInt(retirementAgeInput.value);
    const firstSubDate = new Date(firstSubscriptionDateInput.value);
    const gender = genderSelect.value;
    const isOldSystemEligible = isOldSystemEligibleSelect.value;

    // تحديد نوع التقاعد (مبكر أم شيخوخة) وعتبة العمر
    let retirementAgeThreshold = (gender === 'male') ? 60 : 55;
    const isEarlyRetirement = (retirementAge < retirementAgeThreshold);

    // تحديد النظام (القديم أم الجديد)
    let applyOldSystemRules = false;
    if (firstSubDate < OLD_SYSTEM_DATE_THRESHOLD && isOldSystemEligible === 'yes') {
        applyOldSystemRules = true;
    }

    // --- ب. التحقق من صحة المدخلات ---
    let avgSalary = 0;
    let isAvgSalaryInputFilled = false;

    if (applyOldSystemRules) {
        avgSalary = parseFloat(avgSalaryOldSystemInput.value);
        if (!isNaN(avgSalary) && avgSalary > 0) isAvgSalaryInputFilled = true;
    } else { // نظام جديد
        if (isEarlyRetirement) {
            avgSalary = parseFloat(avgSalary60Input.value);
            if (!isNaN(avgSalary) && avgSalary > 0) isAvgSalaryInputFilled = true;
        } else {
            avgSalary = parseFloat(avgSalary36Input.value);
            if (!isNaN(avgSalary) && avgSalary > 0) isAvgSalaryInputFilled = true;
        }
    }

    if (
        isNaN(subsCount) || subsCount <= 0 ||
        isNaN(dependents) || dependents < 0 || dependents > 3 ||
        isNaN(retirementAge) || retirementAge <= 0 ||
        !isAvgSalaryInputFilled ||
        firstSubscriptionDateInput.value === '' ||
        gender === '' ||
        isOldSystemEligible === ''
    ) {
        resultSpan.innerHTML = 'الرجاء ملء جميع الحقول المطلوبة بشكل صحيح (أرقام موجبة).';
        resultSpan.style.color = '#dc3545';
        return;
    }

    // --- ج. تطبيق خطوات الحساب بناءً على القواعد ---

    let primaryPension = 0;
    let finalGeneralIncrease = 0;

    // 1. حساب المعاش الأساسي: يختلف معامل التقسيم
    if (applyOldSystemRules) {
        primaryPension = (avgSalary * subsCount) / 480;
    } else {
        if (avgSalary <= 1500) {
            primaryPension = (avgSalary * subsCount) / 480;
        } else {
            const partUnder1500 = 1500;
            const partAbove1500 = avgSalary - 1500;
            const pensionUnder1500 = (partUnder1500 * subsCount) / 480;
            const pensionAbove1500 = (partAbove1500 * subsCount) / 600;
            primaryPension = pensionUnder1500 + pensionAbove1500;
        }
    }
    primaryPension = parseFloat(primaryPension.toFixed(3));

    let pensionAfterDiscount = primaryPension;

    // 2. تطبيق خصم التقاعد المبكر (فقط إذا كان مبكراً)
    if (isEarlyRetirement) {
        const discountPercentage = getEarlyRetirementDiscountPercentage(retirementAge, gender);
        const discountAmount = primaryPension * discountPercentage;
        pensionAfterDiscount = primaryPension - discountAmount;
    }
    pensionAfterDiscount = parseFloat(pensionAfterDiscount.toFixed(3));

    // 3. إضافة علاوة المعالين: يختلف السقف
    let dependentsAddition = 0;
    const maxDependent1Addition = 100;
    const maxOtherDependentAddition = 25;
    const newSystemMaxFamilyAllowance = 150;

    if (dependents >= 1) {
        let dependent1Amount = pensionAfterDiscount * 0.12;
        dependentsAddition += Math.min(dependent1Amount, maxDependent1Addition);
    }
    if (dependents >= 2) {
        let dependent2Amount = pensionAfterDiscount * 0.06;
        dependentsAddition += Math.min(dependent2Amount, maxOtherDependentAddition);
    }
    if (dependents >= 3) {
        let dependent3Amount = pensionAfterDiscount * 0.06;
        dependentsAddition += Math.min(dependent3Amount, maxOtherDependentAddition);
    }
    dependentsAddition = parseFloat(dependentsAddition.toFixed(3));

    if (!applyOldSystemRules) {
        dependentsAddition = Math.min(dependentsAddition, newSystemMaxFamilyAllowance);
    }

    // 4. الزيادة العامة: تختلف حسب النظام ونوع التقاعد
    if (applyOldSystemRules) {
        finalGeneralIncrease = 40;
    } else {
        if (isEarlyRetirement) {
            finalGeneralIncrease = 20;
        } else {
            finalGeneralIncrease = 40;
        }
    }

    // 5. جمع الكل للحصول على راتب التقاعد النهائي
    const finalRetirementPension = pensionAfterDiscount + dependentsAddition + finalGeneralIncrease;

    // --- د. عرض النتائج ---
    let resultHTML = `
        <h3>تفاصيل الحساب:</h3>
        <p>النظام المطبق: <strong>${applyOldSystemRules ? 'القديم' : 'الجديد'}</strong></p>
        <p>نوع التقاعد: <strong>${isEarlyRetirement ? 'مبكر' : 'شيخوخة'}</strong></p>
        <p>1. المعاش الأساسي قبل الخصم: <strong>${primaryPension.toFixed(3)} د.أ</strong></p>
    `;

    if (isEarlyRetirement) {
        const discountPercentage = getEarlyRetirementDiscountPercentage(retirementAge, gender);
        const discountAmount = primaryPension * discountPercentage;
        resultHTML += `
            <p style="color: #dc3545;"> نسبة الخصم للتقاعد المبكر: <strong>${(discountPercentage * 100).toFixed(1)}%</strong></p>
            <p style="color: #dc3545;"> مبلغ الخصم: <strong>${discountAmount.toFixed(3)} د.أ</strong></p>
            <p>المعاش بعد خصم المبكر: <strong>${pensionAfterDiscount.toFixed(3)} د.أ</strong></p>
        `;
    } else {
        resultHTML += `<p> لا يوجد خصم للتقاعد المبكر (تقاعد شيخوخة).</p>`;
    }

    resultHTML += `
        <p>3. إضافة علاوة المعالين (${dependents} معال): <strong>${dependentsAddition.toFixed(3)} د.أ</strong>
        ${!applyOldSystemRules ? `<small>(محدودة بـ ${newSystemMaxFamilyAllowance} د.أ للنظام الجديد)</small>` : ''}
        </p>
        <p>4. الزيادة العامة: <strong>${finalGeneralIncrease.toFixed(3)} د.أ</strong></p>
        <hr>
        <p style="font-size: 1.4em; color: #007bff; font-weight: bold;">إجمالي راتب التقاعد التقديري: <strong>${finalRetirementPension.toFixed(3)} د.أ</strong></p>
    `;

    resultSpan.innerHTML = resultHTML;
    resultSpan.style.color = '#28a745';
});

// --- استدعاء الدالة عند تحميل الصفحة للتأكد من الحالة الأولية ---
document.addEventListener('DOMContentLoaded', updateSalaryFieldsVisibility);
