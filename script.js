// Initialize transactions from localStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Urutkan data yang sudah ada di localStorage saat aplikasi dimuat
transactions.sort((a, b) => {
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);
  return dateB - dateA; // Urutan dari terbaru ke terlama
});

const transactionTable = document.getElementById('transactionTable').querySelector('tbody');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const deleteLastBtn = document.getElementById('deleteLastBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const transactionForm = document.getElementById('transactionForm');

// Function to format numbers with thousand separators and decimal points
// Function to format numbers with thousand separators (tanpa desimal)
function formatNumber(number) {
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(number);
}

// Function to convert numbers to words (terbilang)
function numberToWords(number) {
  const units = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
  const tens = ['', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];
  const thousands = ['', 'ribu', 'juta', 'miliar', 'triliun'];

  if (number === 0) return 'nol';
  if (number < 0) return 'minus ' + numberToWords(Math.abs(number));

  let result = '';
  let groupIndex = 0;

  while (number > 0) {
    let group = number % 1000;
    if (group !== 0) {
      let hundreds = Math.floor(group / 100);
      let tensPart = Math.floor((group % 100) / 10);
      let unitsPart = group % 10;

      let groupResult = '';

      if (hundreds > 0) {
        if (hundreds === 1) {
          groupResult += 'seratus ';
        } else {
          groupResult += units[hundreds] + ' ratus ';
        }
      }

      if (tensPart > 1) {
        groupResult += tens[tensPart];
        if (unitsPart > 0) {
          groupResult += ' ' + units[unitsPart];
        }
      } else if (tensPart === 1) {
        if (unitsPart === 0) {
          groupResult += 'sepuluh';
        } else if (unitsPart === 1) {
          groupResult += 'sebelas';
        } else {
          groupResult += units[unitsPart] + ' belas';
        }
      } else if (unitsPart > 0) {
        if (groupIndex === 1 && unitsPart === 1 && hundreds === 0) {
          groupResult += 'se'; // special case for 'seribu'
        } else {
          groupResult += units[unitsPart];
        }
      }

      if (group !== 0) {
        groupResult += ' ' + thousands[groupIndex] + ' ';
      }
      result = groupResult + result;
    }

    number = Math.floor(number / 1000);
    groupIndex++;
  }

  return result.trim();
}

// Function to update the table with transactions
// Tambahkan elemen filter di bagian atas updateTable
// Tambahkan variabel untuk menyimpan data yang difilter
let filteredTransactions = transactions;

function updateSummary(filtered = false) {
  // Hitung total keseluruhan
  const allIncome = transactions.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
  const allExpense = transactions.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.amount, 0);
  
  // Update total keseluruhan
  document.getElementById('totalAll').textContent = formatNumber(allIncome - allExpense);
  document.getElementById('totalAllTerbilang').textContent = numberToWords(Math.abs(allIncome - allExpense));

  // Hitung total berdasarkan filter jika ada
  const displayTransactions = filtered ? filteredTransactions : transactions;
  const totalIncome = displayTransactions.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = displayTransactions.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.amount, 0);

  // Update summary berdasarkan filter
  document.getElementById('totalIncome').textContent = formatNumber(totalIncome);
  document.getElementById('totalIncomeTerbilang').textContent = numberToWords(totalIncome);
  document.getElementById('totalExpense').textContent = formatNumber(totalExpense);
  document.getElementById('totalExpenseTerbilang').textContent = numberToWords(totalExpense);
}

// Modifikasi fungsi updateTable
function updateTable(startDate = null, endDate = null) {
  const filtered = !!(startDate && endDate);
  
  if (filtered) {
    filteredTransactions = transactions.filter(transaction => {
      const transDate = new Date(transaction.date);
      return transDate >= new Date(startDate) && transDate <= new Date(endDate);
    });
  } else {
    filteredTransactions = transactions;
  }

  // Mengurutkan transaksi berdasarkan tanggal
  filteredTransactions.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB; // Urutan dari terlama ke terbaru
  });

  transactionTable.innerHTML = '';
  let totalIncome = 0;
  let totalExpense = 0;

  filteredTransactions.forEach((transaction, index) => {
    const row = document.createElement('tr');
    const formattedAmount = formatNumber(transaction.amount);
    const balance = calculateBalance(index);
    const balanceText = balance < 0 ? `-Rp${formatNumber(Math.abs(balance))}` : `Rp${formatNumber(balance)}`;

    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">${formatDate(transaction.date)}</td>
      <td class="px-6 py-4 whitespace-nowrap">${transaction.description}</td>
      <td class="px-6 py-4">
        <div class="whitespace-nowrap">${transaction.type === 'pemasukan' ? `Rp${formattedAmount}` : ''}</div>
        <small class="text-gray-500 block max-w-[150px] whitespace-normal">${transaction.type === 'pemasukan' ? numberToWords(transaction.amount) : ''}</small>
      </td>
      <td class="px-6 py-4">
        <div class="whitespace-nowrap">${transaction.type === 'pengeluaran' ? `Rp${formattedAmount}` : ''}</div>
        <small class="text-gray-500 block max-w-[150px] whitespace-normal">${transaction.type === 'pengeluaran' ? numberToWords(transaction.amount) : ''}</small>
      </td>
      <td class="px-6 py-4">
        <div class="whitespace-nowrap">${balanceText}</div>
        <small class="text-gray-500 block max-w-[150px] whitespace-normal">${numberToWords(Math.abs(balance))}</small>
      </td>
    `;
    transactionTable.appendChild(row);

    if (transaction.type === 'pemasukan') {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  });

  // Panggil updateSummary setelah update table
  updateSummary(filtered);

  // Save transactions to localStorage
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Event listener for adding new transaction
transactionForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const date = document.getElementById('date').value;
  const description = document.getElementById('description').value;
  const type = document.getElementById('type').value;
  const amount = parseFloat(document.getElementById('amount').value);

  if (!date || !description || !amount) {
    alert('Mohon isi semua field!');
    return;
  }

  transactions.push({ date, description, type, amount });
  
  // Urutkan transactions berdasarkan tanggal sebelum update
  transactions.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA; // Urutan dari terbaru ke terlama
  });
  
  updateTable();
  transactionForm.reset();
});

// Hapus fungsi displayTransactions karena tidak digunakan

// Initial table and summary update
updateTable();  // Ini akan memanggil updateSummary saat halaman dimuat

// Add event listeners for filter
document.getElementById('filterBtn').addEventListener('click', () => {
  const startDate = document.getElementById('filterStartDate').value;
  const endDate = document.getElementById('filterEndDate').value;
  updateTable(startDate, endDate);
});

document.getElementById('resetFilterBtn').addEventListener('click', () => {
  document.getElementById('filterStartDate').value = '';
  document.getElementById('filterEndDate').value = '';
  updateTable();
});

// Function to calculate balance up to a certain index
function calculateBalance(index) {
  let balance = 0;
  for (let i = 0; i <= index; i++) {
    const transaction = transactions[i];
    if (transaction.type === 'pemasukan') {
      balance += transaction.amount;
    } else {
      balance -= transaction.amount;
    }
  }
  return balance;
}

// Event listener for deleting all transactions
deleteAllBtn.addEventListener('click', () => {
  if (confirm('Apakah Anda yakin ingin menghapus semua data?')) {
    transactions = [];
    updateTable();
  }
});

// Event listener for deleting the last transaction
deleteLastBtn.addEventListener('click', () => {
  if (transactions.length > 0) {
    transactions.pop();
    updateTable();
  }
});

// Event listener for exporting to PDF
document.getElementById('exportPdfBtn').addEventListener('click', function() {
    generatePdf();
});

// Function to generate PDF
// Modifikasi fungsi generatePdf
function generatePdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text('Laporan Keuangan', 14, 15);

    // Table Headers
    const headers = ['Tanggal', 'Keterangan', 'Pemasukan (Rp)', 'Pengeluaran (Rp)', 'Saldo (Rp)'];
    const headerRowHeight = 10;
    let yPosition = 25;

    // Draw Table Headers
    headers.forEach((header, index) => {
        doc.setFontSize(12);
        doc.text(header, 10 + index * 40, yPosition);
    });

    yPosition += headerRowHeight;

    // Draw Table Data - Menggunakan filteredTransactions
    let runningBalance = 0;
    filteredTransactions.forEach((transaction, index) => {
        const formattedAmount = formatNumber(transaction.amount);
        if (transaction.type === 'pemasukan') {
            runningBalance += transaction.amount;
        } else {
            runningBalance -= transaction.amount;
        }
        const formattedBalance = formatNumber(runningBalance);

        doc.setFontSize(10);
        doc.text(formatDate(transaction.date), 10, yPosition + index * 10);
        doc.text(transaction.description, 50, yPosition + index * 10);
        doc.text(
            transaction.type === 'pemasukan' ? `Rp${formattedAmount}` : '',
            90,
            yPosition + index * 10
        );
        doc.text(
            transaction.type === 'pengeluaran' ? `Rp${formattedAmount}` : '',
            130,
            yPosition + index * 10
        );
        doc.text(`Rp${formattedBalance}`, 170, yPosition + index * 10);
    });

    // Footer - Menggunakan filteredTransactions
    const totalIncome = filteredTransactions.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = totalIncome - totalExpense;

    doc.setFontSize(12);
    doc.text(`Total Pemasukan: Rp${formatNumber(totalIncome)}`, 10, yPosition + filteredTransactions.length * 10 + 10);
    doc.text(`Total Pengeluaran: Rp${formatNumber(totalExpense)}`, 10, yPosition + filteredTransactions.length * 10 + 20);
    doc.text(`Saldo Akhir: Rp${formatNumber(totalBalance)}`, 10, yPosition + filteredTransactions.length * 10 + 30);

    // Save PDF
    doc.save('laporan_keuangan.pdf');
}

// Initial table update
updateTable();

// Fungsi untuk format tanggal dengan nama hari dalam Bahasa Indonesia
function formatDate(dateString) {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const date = new Date(dateString);
  const dayName = days[date.getDay()];
  const formattedDate = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return `${dayName}, ${formattedDate}`;
} // Menambahkan kurung tutup yang hilang