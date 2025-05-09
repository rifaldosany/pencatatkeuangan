<?php
session_start();
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aplikasi Pencatatan Keuangan<script src="script.php"></script>
  </title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
</head>
<body class="bg-gray-100 font-sans">
  <div class="container mx-auto p-4 max-w-lg bg-white rounded-lg shadow-md mt-8">
    <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Aplikasi Pencatatan Keuangan</h1>

    <!-- Summary -->
    <div class="flex flex-col gap-4 mb-6">

      <!-- Total Keseluruhan -->
      <div class="p-4 bg-blue-200 rounded text-blue-800 font-bold">
        Total Keseluruhan: Rp<span id="totalAll">0</span> (<span id="totalAllTerbilang"></span>)
      </div>
      <!-- Total Filter -->
      <div class="flex justify-between">
        <div class="p-4 bg-green-200 rounded text-green-800 font-bold">
          Pemasukan: Rp<span id="totalIncome">0</span> (<span id="totalIncomeTerbilang"></span>)
        </div>
        <div class="p-4 bg-red-200 rounded text-red-800 font-bold">
          Pengeluaran: Rp<span id="totalExpense">0</span> (<span id="totalExpenseTerbilang"></span>)
        </div>
      </div>
    </div>

    <!-- Form Input Transaksi -->
    <form id="transactionForm" class="mb-6">
      <h2 class="text-xl font-bold text-gray-800 mt-6 mb-4">Tambahkan Data Pemasukan</h2>
      <div class="mb-4">
        <label for="date" class="block text-sm font-medium text-gray-700">Tanggal:</label>
        <input type="date" id="date" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
      </div>
      <div class="mb-4">
        <label for="description" class="block text-sm font-medium text-gray-700">Keterangan:</label>
        <textarea id="description" rows="3" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required></textarea>
      </div>
      <div class="mb-4">
        <label for="type" class="block text-sm font-medium text-gray-700">Tipe Transaksi:</label>
        <select id="type" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
          <option value="pemasukan">Pemasukan</option>
          <option value="pengeluaran">Pengeluaran</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="amount" class="block text-sm font-medium text-gray-700">Jumlah (Rp):</label>
        <input type="number" id="amount" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
      </div>
      <!-- Form submit button -->
      <button type="submit" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <i class="fas fa-plus-circle mr-2"></i>Tambah Transaksi
      </button>
    </form>

    <!-- Buttons -->
    <div class="flex flex-col space-y-2">
      <!-- Delete buttons -->
      <div class="flex flex-col space-y-2">
        <button id="deleteAllBtn" class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
          <i class="fas fa-trash-alt mr-2"></i>Hapus Semua Data
        </button>
        <button id="deleteLastBtn" class="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
          <i class="fas fa-minus-circle mr-2"></i>Hapus Baris Terakhir
        </button>
        <button id="exportPdfBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <i class="fas fa-file-pdf mr-2"></i>Simpan PDF
        </button>
      </div>
    </div>

    <!-- Filter Controls -->
    <h2 class="text-xl font-bold text-gray-800 mt-6 mb-4">Cari Data Tertentu</h2>
    <div id="filterControls" class="mb-4 flex gap-4 items-end mt-6">
      <div>
        <label class="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
        <input type="date" id="filterStartDate" class="mt-1 px-3 py-2 border rounded-md">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Tanggal Akhir</label>
        <input type="date" id="filterEndDate" class="mt-1 px-3 py-2 border rounded-md">
      </div>
      <button id="filterBtn" class="px-4 py-2 bg-blue-600 text-white rounded-md">Cari</button>
      <button id="resetFilterBtn" class="px-4 py-2 bg-gray-500 text-white rounded-md">Reset</button>
    </div>

    <!-- Table Data Keuangan -->
    <h2 class="text-xl font-bold text-gray-800 mt-6 mb-4">Data Keuangan</h2>
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <div class="overflow-x-auto custom-scrollbar">
        <table id="transactionTable" class="w-full text-sm text-left">
          <thead class="text-xs text-white uppercase bg-gradient-to-r from-blue-600 to-blue-800">
            <tr>
              <th scope="col" class="px-6 py-4 whitespace-nowrap font-semibold">Hari, Tanggal</th>
              <th scope="col" class="px-6 py-4 whitespace-nowrap font-semibold">Keterangan</th>
              <th scope="col" class="px-6 py-4 whitespace-nowrap font-semibold">Pemasukan (Rp)</th>
              <th scope="col" class="px-6 py-4 whitespace-nowrap font-semibold">Pengeluaran (Rp)</th>
              <th scope="col" class="px-6 py-4 whitespace-nowrap font-semibold">Saldo (Rp)</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
          </tbody>
        </table>
      </div>
    </div>

    <footer class="text-center text-gray-600 mt-8">
      Aplikasi ini dibuat oleh <strong>Rifaldo Sany</strong>
    </footer>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="script.js"></script>
</body>
</html>
