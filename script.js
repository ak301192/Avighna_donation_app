document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('donationForm');

  if (!form) return;

  const amountInput = document.getElementById('donationAmount');
  const amountChips = document.querySelectorAll('.amount-chip');

  amountChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const value = chip.dataset.amount;
      amountInput.value = value;
      amountChips.forEach((item) => item.classList.toggle('active', item === chip));
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('donorName').value.trim();
    const email = document.getElementById('donorEmail').value.trim();
    const amount = document.getElementById('donationAmount').value.trim();
    const phone = document.getElementById('donorPhone').value.trim();
    const type = document.getElementById('donationType').value;
    const cause = document.getElementById('cause').value;
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !amount || !phone) {
      alert('Please complete all required fields before donating.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (Number(amount) <= 0) {
      alert('Donation amount must be greater than zero.');
      return;
    }

    const donation = {
      name,
      email,
      phone,
      amount,
      type,
      cause,
      message,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('hopeBridgeDonation', JSON.stringify(donation));

    const params = new URLSearchParams({
      name,
      email,
      amount,
      type,
      cause,
      message
    });

    window.location.href = `success.html?${params.toString()}`;
  });
});
